import { useEffect, useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { Input } from '../../../components/Input';
import { restaurantsApi } from '../api/restaurantsApi';
import type { AddressSuggestion } from '../types/restaurant.types';

const MIN_CHARS = 3;
const DEBOUNCE_MS = 250;

/**
 * Address field suggesting EU street addresses as the user types (keyboard:
 * ↑ ↓ to move, Enter to pick, Escape to close). Free text stays allowed: the
 * address is geocoded anyway when the delivery is quoted. `near` (the
 * restaurant) keeps the deliverable surroundings only.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  near,
  placeholder = 'Commencez à taper une adresse',
  required,
  id,
}: {
  value: string;
  onChange: (text: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  near?: { lat: number; lng: number };
  placeholder?: string;
  required?: boolean;
  id?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [query, setQuery] = useState('');

  // Asks once typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(value.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ['address-suggestions', query, near?.lat, near?.lng],
    queryFn: () => restaurantsApi.suggestAddresses(query, near),
    enabled: open && query.length >= MIN_CHARS,
    staleTime: 5 * 60_000,
  });

  const pick = (s: AddressSuggestion) => {
    onSelect(s);
    setOpen(false);
    setActive(-1);
  };

  const showList = open && query.length >= MIN_CHARS && (suggestions.length > 0 || !isFetching);

  return (
    <div className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!showList || suggestions.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % suggestions.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
          } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            pick(suggestions[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-brand/15 bg-white shadow-lg"
        >
          {suggestions.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-neutral-400">Aucune adresse trouvée — vous pouvez la saisir en entier.</li>
          ) : (
            suggestions.map((s, i) => (
              <li
                key={s.label}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                className={`flex cursor-pointer items-start gap-2 px-4 py-2.5 text-sm ${i === active ? 'bg-brand-pale' : 'hover:bg-brand-pale/60'}`}
              >
                <MapPin size={15} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  <span className="font-semibold text-neutral-800">{s.street}</span>
                  <span className="block text-xs text-neutral-500">
                    {s.postalCode} {s.city}, {s.country}
                  </span>
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
