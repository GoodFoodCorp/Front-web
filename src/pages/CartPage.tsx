import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Minus, MapPin, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { formatPrice } from '../utils/format';
import { useCartStore } from '../store/cartStore';
import { selectIsLoggedIn, useAuthStore } from '../store/authStore';
import { useCheckout } from '../features/orders/hooks/useOrders';
import type { Fulfillment } from '../features/orders/types/order.types';
import { usePaymentMethods } from '../features/payments/hooks/usePayments';
import { NEW_CARD, PaymentPicker } from '../features/payments/components/PaymentPicker';
import type { StripeCardElement } from '@stripe/stripe-js';
import { useDeliveryQuote, useRestaurant } from '../features/restaurants/hooks/useRestaurants';
import { stripeEnabled } from '../services/stripe';
import { useMyAddresses } from '../features/profile/hooks/useProfile';
import { AddressAutocomplete } from '../features/restaurants/components/AddressAutocomplete';
import { usePreviewPromoCode } from '../features/promos/hooks/usePromos';
import { ApiError } from '../services/http';
import { dishPhoto } from '../utils/images';

/** Tip suggestions, in cents. */
const TIP_CHOICES = [0, 100, 200, 300, 500];

const REFUSALS: Record<string, string> = {
  CLOSED: 'Le restaurant est fermé pour le moment.',
  PAUSED: 'Le restaurant ne prend plus de commandes pour le moment.',
  OUTOFZONE: 'Cette adresse est hors de la zone de livraison.',
  UNKNOWNADDRESS: 'Adresse introuvable, vérifiez-la.',
  INACTIVE: "Ce restaurant n'est plus disponible.",
};

export function CartPage() {
  const navigate = useNavigate();
  const { lines, restaurantId, restaurantName, add, decrement, remove, totalCents } = useCartStore();
  const checkout = useCheckout();
  const previewPromo = usePreviewPromoCode();
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const { data: addresses } = useMyAddresses();
  const defaultAddress = addresses?.find((a) => a.is_default) ?? addresses?.[0];

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percentOff: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  // The address the assistant checked, when its proposal was moved here.
  const handedOver = (useLocation().state as { address?: string } | null)?.address ?? '';
  // A saved address id, or 'other' for an address typed here.
  const [addressChoice, setAddressChoice] = useState(handedOver ? 'other' : '');
  const [typedAddress, setTypedAddress] = useState(handedOver);
  const [fulfillment, setFulfillment] = useState<Fulfillment>('DELIVERY');
  const [tipCents, setTipCents] = useState(0);
  // A saved card's id, or NEW_CARD for a card typed for this order.
  const [cardId, setCardId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState<StripeCardElement | null>(null);
  const [newCardComplete, setNewCardComplete] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  // One key per checkout attempt: a double click or a retry never places two orders.
  const idempotencyKey = useRef(crypto.randomUUID());

  const { data: cards } = usePaymentMethods();
  const payWithNewCard = stripeEnabled && (cardId === NEW_CARD || (cards !== undefined && cards.length === 0));
  const selectedCard = payWithNewCard
    ? undefined
    : (cards?.find((c) => c.id === cardId) ?? cards?.find((c) => c.isDefault) ?? cards?.[0]);

  const choice = addressChoice || defaultAddress?.id || 'other';
  const savedAddress = addresses?.find((a) => a.id === choice);
  const address = savedAddress?.full_address ?? typedAddress;
  const { data: restaurant } = useRestaurant(restaurantId ?? undefined);
  const near =
    restaurant?.latitude != null && restaurant?.longitude != null
      ? { lat: restaurant.latitude, lng: restaurant.longitude }
      : undefined;
  const isPickup = fulfillment === 'PICKUP';
  const { data: quote } = useDeliveryQuote(
    restaurantId,
    isPickup ? '' : address,
    isLoggedIn && (isPickup || address.trim().length > 3),
  );

  const subtotal = totalCents();
  const discount = appliedPromo ? Math.floor((subtotal * appliedPromo.percentOff) / 100) : 0;
  // The server computes the amount charged; this mirrors it for display.
  const deliveryFee = isPickup ? 0 : (quote?.deliveryFeeCents ?? 0);
  const total = Math.max(0, subtotal - discount) + deliveryFee + tipCents;
  const belowMinimum = !isPickup && !!quote && subtotal - discount < quote.minimumOrderCents;
  const refusal = quote && !quote.canOrder ? (REFUSALS[quote.refusal ?? ''] ?? REFUSALS.INACTIVE) : null;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    previewPromo.mutate(
      { code, amountCents: subtotal },
      {
        onSuccess: (preview) => {
          setAppliedPromo({ code: preview.code, percentOff: preview.percent_off });
          setPromoError(null);
        },
        onError: (err) => {
          setAppliedPromo(null);
          setPromoError(
            err instanceof ApiError && err.status === 404
              ? "Ce code promo n'existe pas."
              : err instanceof ApiError
                ? err.message
                : 'Code promo invalide.',
          );
        },
      },
    );
  };

  const placeOrder = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (!restaurantId) return;
    checkout.mutate(
      {
        order: {
          restaurant_id: restaurantId,
          delivery_address: isPickup ? '' : address,
          items: lines.map((l) => ({
            menu_item_id: l.item.id,
            menu_item_name: l.item.name,
            quantity: l.quantity,
            unit_price_cents: l.item.priceCents,
          })),
          promo_code: appliedPromo?.code,
          fulfillment,
          tip_cents: tipCents,
        },
        paymentMethodId: selectedCard?.id,
        newCard: payWithNewCard ? (newCard ?? undefined) : undefined,
        saveCard: payWithNewCard && saveCard,
        idempotencyKey: idempotencyKey.current,
      },
      {
        onSuccess: ({ order, cardSaved }) => {
          idempotencyKey.current = crypto.randomUUID();
          navigate(`/orders/${order.id}`, { state: { justPaid: true, cardSaved } });
        },
      },
    );
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState icon="🛒" title="Votre panier est vide" hint="Choisissez un restaurant et ajoutez des plats." />
        <div className="mt-6 text-center">
          <Button onClick={() => navigate('/')}>Voir les restaurants</Button>
        </div>
      </div>
    );
  }

  const needsCard = stripeEnabled && (payWithNewCard ? !newCard || !newCardComplete : !selectedCard);
  const canOrder =
    (isPickup || address.trim().length > 3) && !refusal && !belowMinimum && !needsCard && !checkout.isPending;
  const eta = quote ? `${quote.estimatedDeliveryMinutes} min` : '30-40 min';

  return (
    <div>
      <div className="border-b border-brand/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <ArrowLeft size={16} /> Continuer mes achats
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold text-brand">Mon Panier</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-brand/10 bg-white">
              <p className="border-b border-brand/10 px-5 py-4 text-sm font-semibold text-neutral-500">
                Articles ({lines.length})
              </p>
              <div className="divide-y divide-brand/10">
                {lines.map((line) => (
                  <div key={line.item.id} className="flex items-center gap-4 px-5 py-4">
                    <div
                      className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${line.item.imageUrl || dishPhoto(line.item.name, line.item.category)})`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display font-bold text-brand">{line.item.name}</p>
                        <button
                          onClick={() => remove(line.item.id)}
                          className="shrink-0 text-red-500 transition hover:text-red-700"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                      <p className="truncate text-sm text-neutral-400">{line.item.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decrement(line.item.id)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-brand/15 text-brand hover:bg-brand-pale"
                            aria-label="Retirer un"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
                          <button
                            onClick={() =>
                              restaurantId &&
                              restaurantName &&
                              add(line.item, { id: restaurantId, name: restaurantName })
                            }
                            className="grid h-7 w-7 place-items-center rounded-lg border border-brand/15 text-brand hover:bg-brand-pale"
                            aria-label="Ajouter un"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-display font-bold text-brand">
                          {formatPrice(line.item.priceCents * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            <div className="rounded-2xl border border-brand/10 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand">
                  <MapPin size={16} /> {isPickup ? 'Retrait au restaurant' : 'Adresse de livraison'}
                </div>
                <div className="flex rounded-lg border border-brand/15 p-0.5 text-xs font-semibold">
                  {(['DELIVERY', 'PICKUP'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFulfillment(f)}
                      className={`rounded-md px-3 py-1 ${fulfillment === f ? 'bg-brand text-white' : 'text-brand'}`}
                    >
                      {f === 'DELIVERY' ? 'Livraison' : 'À emporter'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="rounded-lg border border-brand/20 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand-pale"
                >
                  Modifier
                </button>
              </div>
              {isPickup ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
                  <Clock size={13} /> À retirer chez {restaurantName} dans environ {quote?.prepTimeMinutes ?? 20} min
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {addresses?.map((a) => (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${choice === a.id ? 'border-brand bg-brand-pale/50' : 'border-brand/10'}`}
                    >
                      <input type="radio" name="address" className="mt-1" checked={choice === a.id} onChange={() => setAddressChoice(a.id)} />
                      <span>
                        <span className="font-display font-bold text-brand">{a.label}</span>
                        <span className="block text-neutral-500">{a.full_address}</span>
                      </span>
                    </label>
                  ))}
                  {addresses && addresses.length > 0 && (
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${choice === 'other' ? 'border-brand bg-brand-pale/50' : 'border-brand/10'}`}
                    >
                      <input type="radio" name="address" checked={choice === 'other'} onChange={() => setAddressChoice('other')} />
                      <span className="font-semibold text-brand">Une autre adresse</span>
                    </label>
                  )}
                  {choice === 'other' && (
                    <AddressAutocomplete
                      value={typedAddress}
                      onChange={setTypedAddress}
                      onSelect={(s) => setTypedAddress(s.label)}
                      near={near}
                      placeholder="Ex. 12 rue de la République, Paris"
                    />
                  )}
                  <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock size={13} /> Livraison estimée : {eta}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="sticky top-24 space-y-4 rounded-2xl border border-brand/10 bg-white p-5">
              <h2 className="font-display text-lg font-bold text-brand">Résumé de la commande</h2>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Code promo</label>
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError(null);
                    }}
                    placeholder="Entrez votre code"
                    className="w-full rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                  <Button onClick={applyPromo} disabled={previewPromo.isPending} className="shrink-0 px-4">
                    {previewPromo.isPending ? '…' : 'Appliquer'}
                  </Button>
                </div>
                {promoError && <p className="mt-1.5 text-xs text-red-600">{promoError}</p>}
                {appliedPromo && (
                  <p className="mt-1.5 text-xs font-semibold text-brand">
                    Code {appliedPromo.code} appliqué (-{appliedPromo.percentOff}%)
                  </p>
                )}
              </div>

              <div className="space-y-1.5 border-t border-brand/10 pt-4 text-sm">
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-brand">
                    <span>Réduction</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}
                {!isPickup && (
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Frais de livraison</span>
                    <span className={deliveryFee === 0 ? 'text-brand' : ''}>
                      {deliveryFee === 0 ? 'Offerts' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Pourboire</span>
                  <span>{formatPrice(tipCents)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {TIP_CHOICES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTipCents(t)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${tipCents === t ? 'border-brand bg-brand text-white' : 'border-brand/20 text-brand'}`}
                    >
                      {t === 0 ? 'Aucun' : formatPrice(t)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-brand/10 pt-3 font-display text-xl font-extrabold text-brand">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {stripeEnabled && cards && (
                <PaymentPicker
                  cards={cards}
                  value={payWithNewCard ? NEW_CARD : (selectedCard?.id ?? NEW_CARD)}
                  onChange={setCardId}
                  onNewCard={setNewCard}
                  onNewCardComplete={setNewCardComplete}
                  saveCard={saveCard}
                  onSaveCardChange={setSaveCard}
                />
              )}
              {needsCard && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Saisissez votre carte pour payer.
                </p>
              )}
              {refusal && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{refusal}</p>}
              {belowMinimum && quote && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Minimum de commande pour la livraison : {formatPrice(quote.minimumOrderCents)}
                </p>
              )}

              {checkout.isError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {(checkout.error as Error).message}
                </p>
              )}

              <Button onClick={placeOrder} variant="accent" disabled={!canOrder} className="w-full py-3">
                {checkout.isPending ? 'Paiement en cours…' : 'Passer la commande'}
              </Button>

              <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Clock size={13} /> {isPickup ? 'Prêt' : 'Livraison'} sous {isPickup ? `${quote?.prepTimeMinutes ?? 20} min` : eta}
              </p>
              <p className="text-xs text-neutral-400">
                En passant commande, vous acceptez nos conditions d'utilisation et notre politique de
                confidentialité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
