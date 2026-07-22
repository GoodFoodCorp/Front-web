/** Pure UI loading indicator. */
export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-brand/60">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
