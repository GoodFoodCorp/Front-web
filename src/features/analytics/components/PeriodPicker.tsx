const PERIODS = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '90 jours' },
];

/** Pure UI time-range filter, sitting in one row above the charts. */
export function PeriodPicker({ days, onChange }: { days: number; onChange: (days: number) => void }) {
  return (
    <div className="flex gap-1 rounded-xl border border-brand/10 bg-white p-1">
      {PERIODS.map((period) => (
        <button
          key={period.days}
          onClick={() => onChange(period.days)}
          aria-pressed={days === period.days}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            days === period.days ? 'bg-brand text-white' : 'text-neutral-500 hover:text-brand'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
