import { ALLERGENS } from '../allergens';

/** The 14 regulatory allergens as toggles; the dish's are checked. */
export function AllergenPicker({ value, onChange }: { value: string[]; onChange: (codes: string[]) => void }) {
  const toggle = (code: string) =>
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code]);
  return (
    <fieldset>
      <legend className="sr-only">Allergènes présents dans le plat</legend>
      <div className="flex flex-wrap gap-2">
        {ALLERGENS.map((a) => {
          const on = value.includes(a.code);
          return (
            <label
              key={a.code}
              className={`cursor-pointer select-none rounded-full border px-3 py-1.5 text-sm transition focus-within:ring-2 focus-within:ring-brand/30 ${
                on ? 'border-brand bg-brand text-white' : 'border-brand/15 bg-white text-neutral-600 hover:border-brand/40'
              }`}
            >
              <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(a.code)} />
              <span aria-hidden>{a.icon}</span> {a.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
