import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toISODate, todayISODate } from '../../utils/date';

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/** Monday-first weekday index (0 = Monday .. 6 = Sunday). */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Pure UI month calendar — pick a single day, like a hotel booking widget. */
export function Calendar({
  value,
  onChange,
  minDate = todayISODate(),
}: {
  value: string | null;
  onChange: (isoDate: string) => void;
  minDate?: string;
}) {
  const min = new Date(`${minDate}T00:00:00`);
  const initial = value ? new Date(`${value}T00:00:00`) : min;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = mondayIndex(new Date(viewYear, viewMonth, 1));
  const cells: (Date | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  const canGoPrev = new Date(viewYear, viewMonth, 1) > new Date(min.getFullYear(), min.getMonth(), 1);

  const goPrev = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goNext = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Mois précédent"
          className="grid h-8 w-8 place-items-center rounded-lg text-brand transition hover:bg-brand-pale disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="font-display text-sm font-bold text-brand">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={goNext}
          aria-label="Mois suivant"
          className="grid h-8 w-8 place-items-center rounded-lg text-brand transition hover:bg-brand-pale"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;
          const iso = toISODate(date);
          const disabled = date < min;
          const isSelected = value === iso;
          const isToday = todayISODate() === iso;
          return (
            <button
              type="button"
              key={iso}
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={`grid h-9 place-items-center rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent ${
                isSelected
                  ? 'bg-brand text-white'
                  : isToday
                    ? 'border border-brand/40 text-brand hover:bg-brand-pale'
                    : 'text-neutral-600 hover:bg-brand-pale hover:text-brand'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
