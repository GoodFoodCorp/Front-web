import { create } from 'zustand';
import { http } from '../../services/http';

/** One piece of news, as delivery-service sends and keeps it. */
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  orderId?: string;
  status?: string;
  /** Page to open from the notification. */
  link: string;
  at: string;
  read?: boolean;
}

const KEEP = 50;

const notificationsApi = {
  list: () => http<{ items: AppNotification[]; unread: number }>('/api/notifications'),
  markRead: () => http<void>('/api/notifications/read', { method: 'POST' }),
};

interface NotificationState {
  items: AppNotification[];
  /** Shown as a toast for a few seconds. */
  toasts: AppNotification[];
  ownerId: string | null;
  /** Adds a live one, once (a reconnection may replay it); false if already known. */
  push: (n: AppNotification) => boolean;
  dismissToast: (id: string) => void;
  markAllRead: () => void;
  /** Loads what the server kept: after signing in, after a reconnection. */
  sync: () => Promise<void>;
  claimFor: (userId: string | null) => void;
}

/**
 * The bell's content comes from the server, which keeps every notification:
 * signing out and in again, or opening another device, shows the same list
 * and the same unread ones. Live notifications are added on top.
 */
export const useNotificationStore = create<NotificationState>()((set, get) => ({
  items: [],
  toasts: [],
  ownerId: null,
  push: (n) => {
    if (get().items.some((i) => i.id === n.id)) return false;
    set((s) => ({ items: [{ ...n, read: false }, ...s.items].slice(0, KEEP), toasts: [...s.toasts, n].slice(-3) }));
    return true;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  markAllRead: () => {
    if (!get().items.some((i) => !i.read)) return;
    set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) }));
    void notificationsApi.markRead().catch(() => undefined);
  },
  sync: async () => {
    const owner = get().ownerId;
    try {
      const { items } = await notificationsApi.list();
      if (get().ownerId !== owner) return; // signed out meanwhile
      // Live ones that arrived during the request stay.
      const known = new Set(items.map((i) => i.id));
      const live = get().items.filter((i) => !known.has(i.id));
      set({ items: [...live, ...items].slice(0, KEEP) });
    } catch {
      /* the bell keeps what it has */
    }
  },
  claimFor: (userId) => set((s) => (s.ownerId === userId ? s : { ownerId: userId, items: [], toasts: [] })),
}));

export const selectUnread = (s: NotificationState) => s.items.filter((i) => !i.read).length;
