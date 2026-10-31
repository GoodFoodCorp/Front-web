import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, X } from 'lucide-react';
import { selectUnread, useNotificationStore, type AppNotification } from './notificationStore';

function ago(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `il y a ${hours} h` : new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/** The bell of every header: the latest news, and system notifications on demand. */
export function NotificationBell({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const navigate = useNavigate();
  const items = useNotificationStore((s) => s.items);
  const unread = useNotificationStore(selectUnread);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState(typeof Notification === 'undefined' ? 'denied' : Notification.permission);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const toggle = () => {
    if (open) markAllRead();
    setOpen(!open);
  };
  const go = (n: AppNotification) => {
    setOpen(false);
    markAllRead();
    navigate(n.link);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread ? `Notifications, ${unread} non lues` : 'Notifications'}
        className={`relative grid h-10 w-10 place-items-center rounded-lg transition ${
          tone === 'light' ? 'text-white/90 hover:bg-white/10' : 'text-neutral-600 hover:bg-neutral-100'
        }`}
      >
        {unread ? <BellRing size={20} /> : <Bell size={20} />}
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-brand/10 bg-white text-neutral-800 shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between border-b border-brand/10 px-4 py-3">
            <p className="font-display font-bold text-brand">Notifications</p>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="text-neutral-400 hover:text-neutral-700">
              <X size={16} />
            </button>
          </div>
          {permission === 'default' && (
            <button
              onClick={() => void Notification.requestPermission().then(setPermission)}
              className="w-full bg-brand-pale px-4 py-2.5 text-left text-xs font-semibold text-brand hover:bg-brand-pale/70"
            >
              Recevoir les notifications même quand l'onglet est en arrière-plan
            </button>
          )}
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-neutral-400">Aucune notification</li>}
            {items.map((n) => (
              <li key={n.id}>
                <button onClick={() => go(n)} className="flex w-full gap-3 px-4 py-3 text-left hover:bg-neutral-50">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-accent'}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-neutral-800">{n.title}</span>
                    <span className="block text-sm text-neutral-500">{n.body}</span>
                    <span className="block text-xs text-neutral-400">{ago(n.at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
