import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** One piece of news, as delivery-service sends it. */
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

const KEEP = 30;

interface NotificationState {
  items: AppNotification[];
  /** Shown as a toast for a few seconds. */
  toasts: AppNotification[];
  ownerId: string | null;
  push: (n: AppNotification) => boolean;
  dismissToast: (id: string) => void;
  markAllRead: () => void;
  claimFor: (userId: string | null) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: [],
      toasts: [],
      ownerId: null,
      /** Adds it once (a reconnection may replay one); false if already seen. */
      push: (n) => {
        if (get().items.some((i) => i.id === n.id)) return false;
        set((s) => ({ items: [{ ...n, read: false }, ...s.items].slice(0, KEEP), toasts: [...s.toasts, n].slice(-3) }));
        return true;
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      markAllRead: () => set((s) => ({ items: s.items.map((i) => ({ ...i, read: true })) })),
      claimFor: (userId) =>
        set((s) => (s.ownerId === userId ? s : { ownerId: userId, items: [], toasts: [] })),
    }),
    { name: 'goodfood.notifications', partialize: ({ items, ownerId }) => ({ items, ownerId }) },
  ),
);

export const selectUnread = (s: NotificationState) => s.items.filter((i) => !i.read).length;
