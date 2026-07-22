import type { ReactNode } from 'react';

const BADGE_TONES = {
  green: 'bg-brand-pale text-brand',
  yellow: 'bg-accent/25 text-brand-dark',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-neutral-100 text-neutral-600',
  blue: 'bg-blue-100 text-blue-700',
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

/** Pure UI status pill. */
export function Badge({ children, tone = 'gray' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}
