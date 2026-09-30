import { useEffect } from 'react';
import { X } from 'lucide-react';

/** Pure UI popup dialog — centered panel over a dismissible backdrop. */
export function Modal({
  title,
  onClose,
  children,
  maxWidth = 'max-w-2xl',
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 py-10">
      <button
        aria-label="Fermer"
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
      />
      <div
        className={`relative w-full ${maxWidth} animate-[pop_0.2s_both] rounded-2xl bg-white shadow-[var(--shadow-lift)]`}
      >
        <div className="flex items-center justify-between border-b border-brand/10 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-brand">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-9 w-9 place-items-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
