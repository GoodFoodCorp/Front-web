import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  /** Second line, in grey (a city, a card's expiry…). */
  hint?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

/**
 * Drop-down list styled like the rest of the site (the browser's own <select>
 * looks different on every system). Keyboard: Enter/Space/↓ open, ↑ ↓ move,
 * Enter picks, Escape closes, a letter jumps to the first matching option.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = 'Choisir…',
  disabled,
  id,
  className = '',
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (open && active >= 0) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const openList = () => {
    if (disabled) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const pick = (o: SelectOption | undefined) => {
    if (!o || o.disabled) return;
    onChange(o.value);
    setOpen(false);
  };

  const move = (step: number) => {
    if (options.length === 0) return;
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + step + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(options[active]);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    } else if (e.key.length === 1) {
      const i = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-left text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400 ${
          open ? 'border-brand ring-2 ring-brand/20' : 'border-brand/15 hover:border-brand/40'
        }`}
      >
        {selected?.icon}
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-neutral-800' : 'text-neutral-400'}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-brand/60 transition ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          // Inside a <label>, a click would otherwise also "click" the button.
          onClick={(e) => e.preventDefault()}
          className="absolute z-30 mt-1.5 max-h-64 w-full min-w-[12rem] overflow-y-auto rounded-xl border border-brand/10 bg-white p-1 shadow-[var(--shadow-lift)] animate-[pop_0.12s_both]"
        >
          {options.length === 0 && <li className="px-3 py-2 text-sm text-neutral-400">Aucun choix</li>}
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={o.disabled}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o);
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  o.disabled ? 'cursor-not-allowed text-neutral-300' : i === active ? 'bg-brand-pale text-brand' : 'text-neutral-700'
                }`}
              >
                {o.icon}
                <span className="min-w-0 flex-1">
                  <span className={`block truncate ${isSelected ? 'font-semibold' : ''}`}>{o.label}</span>
                  {o.hint && <span className="block truncate text-xs text-neutral-400">{o.hint}</span>}
                </span>
                {isSelected && <Check size={15} className="shrink-0 text-brand" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
