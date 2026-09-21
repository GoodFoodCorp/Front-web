import { EmptyState } from '../../../components/EmptyState';

/**
 * Ranked top-5 with a proportional bar per row — a magnitude comparison over a
 * handful of named entities reads better as a ranked list than as a pie, and
 * the label sits next to its own bar so identity never depends on colour.
 */
export function TopList({
  title,
  subtitle,
  rows,
  emptyIcon,
  emptyTitle,
}: {
  title: string;
  subtitle: string;
  rows: { id: string; label: string; caption: string; value: number }[];
  emptyIcon: string;
  emptyTitle: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-5">
      <h2 className="font-display font-bold text-brand">{title}</h2>
      <p className="mb-4 text-sm text-neutral-400">{subtitle}</p>

      {rows.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} />
      ) : (
        <ol className="space-y-3">
          {rows.map((row, index) => (
            <li key={row.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-semibold text-neutral-700">
                  <span className="mr-2 text-neutral-300">{index + 1}</span>
                  {row.label}
                </span>
                <span className="shrink-0 font-display text-sm font-bold text-brand">{row.caption}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-pale">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.round((row.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
