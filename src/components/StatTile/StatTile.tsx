import type { LucideIcon } from 'lucide-react';

/** Pure UI KPI tile — a headline number needs no chart. */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  index = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  /** Staggers the entrance animation when tiles are rendered in a row. */
  index?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="animate-[rise_0.4s_both] rounded-2xl border border-brand/10 bg-white p-5"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-neutral-500">{label}</p>
        <Icon size={18} className="text-neutral-400" />
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold text-brand">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}
