import type { ReactNode } from 'react';

/** Pure UI surface card. */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-brand/10 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
