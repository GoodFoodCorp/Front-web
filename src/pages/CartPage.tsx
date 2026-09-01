import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Minus, MapPin, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { formatPrice } from '../utils/format';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useCheckout } from '../features/orders/hooks/useOrders';
import { useMyAddresses } from '../features/profile/hooks/useProfile';
import { dishPhoto } from '../utils/images';

const FREE_DELIVERY_THRESHOLD_CENTS = 3000;
const DELIVERY_FEE_CENTS = 399;

const PROMO_CODES: Record<string, number> = {
  BIENVENUE20: 0.2,
  WELCOME20: 0.2,
  GOODFOOD10: 0.1,
};

export function CartPage() {
  const navigate = useNavigate();
  const { lines, restaurantId, restaurantName, add, decrement, remove, totalCents } = useCartStore();
  const checkout = useCheckout();
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);
  const { data: addresses } = useMyAddresses();
  const defaultAddress = addresses?.find((a) => a.is_default) ?? addresses?.[0];

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const subtotal = totalCents();
  const discount = appliedPromo ? Math.round(subtotal * PROMO_CODES[appliedPromo]) : 0;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD_CENTS ? 0 : DELIVERY_FEE_CENTS;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  const address = defaultAddress?.full_address ?? manualAddress;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError(false);
    } else {
      setAppliedPromo(null);
      setPromoError(true);
    }
  };

  const placeOrder = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (!restaurantId) return;
    checkout.mutate(
      {
        restaurant_id: restaurantId,
        delivery_address: address,
        items: lines.map((l) => ({
          menu_item_id: l.item.id,
          menu_item_name: l.item.name,
          quantity: l.quantity,
          unit_price_cents: l.item.priceCents,
        })),
      },
      { onSuccess: (order) => navigate(`/orders/${order.id}`, { state: { justPaid: true } }) },
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

  const canOrder = address.trim().length > 3 && !checkout.isPending;

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
                  <MapPin size={16} /> Adresse de livraison
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="rounded-lg border border-brand/20 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand-pale"
                >
                  Modifier
                </button>
              </div>
              {defaultAddress ? (
                <div className="mt-3">
                  <p className="font-display font-bold text-brand">{defaultAddress.label}</p>
                  <p className="text-sm text-neutral-500">
                    {defaultAddress.street}
                    <br />
                    {defaultAddress.city}, {defaultAddress.zip_code}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock size={13} /> Livraison estimée : 30-40 min
                  </p>
                </div>
              ) : (
                <input
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="12 rue de la République, 75001 Paris"
                  className="mt-3 w-full rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
                />
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
                      setPromoError(false);
                    }}
                    placeholder="Entrez votre code"
                    className="w-full rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
                  />
                  <Button onClick={applyPromo} className="shrink-0 px-4">
                    Appliquer
                  </Button>
                </div>
                {promoError && <p className="mt-1.5 text-xs text-red-600">Code promo invalide.</p>}
                {appliedPromo && (
                  <p className="mt-1.5 text-xs font-semibold text-brand">
                    Code {appliedPromo} appliqué (-{PROMO_CODES[appliedPromo] * 100}%)
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
                <div className="flex items-center justify-between text-neutral-500">
                  <span>Frais de livraison</span>
                  <span className={deliveryFee === 0 ? 'text-brand' : ''}>
                    {deliveryFee === 0 ? 'Offerts' : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-brand/10 pt-3 font-display text-xl font-extrabold text-brand">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {checkout.isError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {(checkout.error as Error).message}
                </p>
              )}

              <Button onClick={placeOrder} variant="accent" disabled={!canOrder} className="w-full py-3">
                {checkout.isPending ? 'Paiement en cours…' : 'Passer la commande'}
              </Button>

              <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Clock size={13} /> Livraison sous 30-40 min
              </p>
              <p className="text-xs text-neutral-400">
                En passant commande, vous acceptez nos conditions d'utilisation et notre politique de
                confidentialité.
              </p>

              <div className="rounded-xl bg-brand-pale p-3 text-xs text-brand">
                <p className="font-semibold">Codes promos disponibles :</p>
                <ul className="mt-1 space-y-0.5">
                  <li>• GOODFOOD10 - 10% de réduction</li>
                  <li>• WELCOME20 - 20% de réduction</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
