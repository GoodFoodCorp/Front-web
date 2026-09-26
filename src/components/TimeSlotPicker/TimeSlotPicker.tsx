export interface SlotGroup {
  label: string;
  slots: string[];
}

/** Pure UI grid of time slots, grouped (e.g. Déjeuner / Dîner). Slots listed
 *  in `fullSlots` render greyed out and disabled — already fully booked. */
export function TimeSlotPicker({
  groups,
  value,
  onChange,
  fullSlots = [],
}: {
  groups: SlotGroup[];
  value: string | null;
  onChange: (time: string) => void;
  fullSlots?: string[];
}) {
  const visibleGroups = groups.filter((g) => g.slots.length > 0);

  if (visibleGroups.length === 0) {
    return <p className="text-sm text-neutral-400">Aucun créneau disponible ce jour-là.</p>;
  }

  return (
    <div className="space-y-3">
      {visibleGroups.map((g) => (
        <div key={g.label}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">{g.label}</p>
          <div className="flex flex-wrap gap-2">
            {g.slots.map((t) => {
              const full = fullSlots.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  disabled={full}
                  onClick={() => onChange(t)}
                  aria-label={full ? `${t}, complet` : t}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    full
                      ? 'cursor-not-allowed bg-neutral-100 text-neutral-300 line-through'
                      : value === t
                        ? 'bg-brand text-white'
                        : 'bg-brand-pale text-brand hover:bg-brand/20'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
