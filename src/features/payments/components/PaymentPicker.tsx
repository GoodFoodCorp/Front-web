import { Check, CreditCard, Plus } from 'lucide-react';
import type { StripeCardElement } from '@stripe/stripe-js';
import type { PaymentMethod } from '../types/payment.types';
import { NewCardField } from './NewCardField';

/** The "pay with a card typed now" choice. */
export const NEW_CARD = 'new';

/**
 * How the customer pays this order: one of their saved cards, or a card
 * typed now and used for this payment only.
 */
export function PaymentPicker({
  cards,
  value,
  onChange,
  onNewCard,
  onNewCardComplete,
  saveCard,
  onSaveCardChange,
}: {
  cards: PaymentMethod[];
  value: string;
  onChange: (value: string) => void;
  onNewCard: (card: StripeCardElement | null) => void;
  onNewCardComplete: (complete: boolean) => void;
  /** Keep the typed card after the payment (asked, never by default). */
  saveCard?: boolean;
  onSaveCardChange?: (save: boolean) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-sm font-semibold text-neutral-700">Paiement</legend>
      {cards.map((c) => (
        <Tile key={c.id} selected={value === c.id} onSelect={() => onChange(c.id)}>
          <CreditCard size={18} className="shrink-0 text-brand" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold capitalize text-neutral-800">
              {c.brand} •••• {c.last4}
            </span>
            <span className="block text-xs text-neutral-400">
              Expire {String(c.expMonth).padStart(2, '0')}/{String(c.expYear).slice(-2)}
              {c.isDefault && ' · par défaut'}
            </span>
          </span>
        </Tile>
      ))}
      <Tile selected={value === NEW_CARD} onSelect={() => onChange(NEW_CARD)}>
        <Plus size={18} className="shrink-0 text-brand" aria-hidden />
        <span className="flex-1">
          <span className="block font-semibold text-neutral-800">Nouvelle carte</span>
          <span className="block text-xs text-neutral-400">Saisie sécurisée par Stripe</span>
        </span>
      </Tile>
      {value === NEW_CARD && (
        <>
          <NewCardField onReady={onNewCard} onComplete={onNewCardComplete} />
          {onSaveCardChange && (
            <label className="flex items-center gap-2 px-1 text-sm text-neutral-600">
              <input type="checkbox" checked={!!saveCard} onChange={(e) => onSaveCardChange(e.target.checked)} />
              Enregistrer cette carte pour mes prochaines commandes
            </label>
          )}
        </>
      )}
    </fieldset>
  );
}

function Tile({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
        selected ? 'border-brand bg-brand-pale/60 ring-1 ring-brand' : 'border-brand/15 bg-white hover:border-brand/40'
      }`}
    >
      {children}
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          selected ? 'border-brand bg-brand text-white' : 'border-neutral-300'
        }`}
        aria-hidden
      >
        {selected && <Check size={12} />}
      </span>
    </button>
  );
}
