/** Pure UI empty-state placeholder. */
export function EmptyState({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand/20 py-14 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="font-display font-semibold text-brand">{title}</p>
      {hint && <p className="text-sm text-neutral-500">{hint}</p>}
    </div>
  );
}
