import { useState } from 'react';
import { Star } from 'lucide-react';
import { RATING_LABELS } from '../rating';

/** Five radio stars (hover previews, keyboard picks), with the mark's label beside them. */
export function StarPicker({
  name,
  value,
  onChange,
  legend = 'Votre note',
}: {
  name: string;
  value: number;
  onChange: (rating: number) => void;
  legend?: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <span className="sr-only">{`${n} étoile${n > 1 ? 's' : ''} : ${RATING_LABELS[n]}`}</span>
            <Star
              size={30}
              aria-hidden
              className={`rounded transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand ${
                n <= shown ? 'fill-accent text-accent' : 'fill-neutral-100 text-neutral-300'
              }`}
            />
          </label>
        ))}
        <span className="ml-2 text-sm font-semibold text-neutral-600" aria-live="polite">
          {RATING_LABELS[shown]}
        </span>
      </div>
    </fieldset>
  );
}
