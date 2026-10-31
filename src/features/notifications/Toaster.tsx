import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useNotificationStore, type AppNotification } from './notificationStore';

const SHOWN_MS = 6000;

/** The latest notifications, top right, for a few seconds. */
export function Toaster() {
  const toasts = useNotificationStore((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}

function Toast({ toast }: { toast: AppNotification }) {
  const navigate = useNavigate();
  const dismiss = useNotificationStore((s) => s.dismissToast);
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), SHOWN_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div className="pointer-events-auto flex animate-[pop_0.2s_both] items-start gap-3 rounded-2xl border border-brand/10 bg-white p-3 shadow-[var(--shadow-lift)]">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-pale text-brand">
        <Bell size={15} />
      </span>
      <button
        className="min-w-0 flex-1 text-left"
        onClick={() => {
          dismiss(toast.id);
          navigate(toast.link);
        }}
      >
        <span className="block text-sm font-semibold text-neutral-800">{toast.title}</span>
        <span className="block text-sm text-neutral-500">{toast.body}</span>
      </button>
      <button onClick={() => dismiss(toast.id)} aria-label="Fermer" className="text-neutral-300 hover:text-neutral-600">
        <X size={15} />
      </button>
    </div>
  );
}
