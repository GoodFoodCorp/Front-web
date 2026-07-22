import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Minus, Plus, Store, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { formatPrice } from '../utils/format';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useCheckout } from '../features/orders/hooks/useOrders';

export function CartPage() {
  const navigate = useNavigate();
  const { lines, restaurantId, restaurantName, add, decrement, remove, totalCents } = useCartStore();
  const checkout = useCheckout();
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);

  const [address, setAddress] = useState('');
  const total = totalCents();

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
      <div className="mx-auto max-w-lg py-10">
        <EmptyState icon="🛒" title="Votre panier est vide" hint="Choisissez un restaurant et ajoutez des plats." />
        <div className="mt-6 text-center">
          <Button onClick={() => navigate('/')}>Voir les restaurants</Button>
        </div>
      </div>
    );
  }

  const canOrder = address.trim().length > 3 && !checkout.isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="mb-1 font-display text-2xl font-bold text-brand">Votre panier</h1>
        {restaurantName && (
          <p className="mb-4 flex items-center gap-1.5 text-sm text-neutral-500">
            <Store size={15} className="text-brand" /> {restaurantName}
          </p>
        )}
        <div className="space-y-3">
          {lines.map((line) => (
            <Card key={line.item.id} className="flex items-center gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand-pale text-3xl">
                {line.item.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-brand">{line.item.name}</p>
                <p className="text-sm text-neutral-500">{formatPrice(line.item.priceCents)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decrement(line.item.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-brand/15 text-brand hover:bg-brand-pale"
                  aria-label="Retirer un"
                >
                  <Minus size={15} />
                </button>
                <span className="w-6 text-center font-semibold">{line.quantity}</span>
                <button
                  onClick={() =>
                    restaurantId &&
                    restaurantName &&
                    add(line.item, { id: restaurantId, name: restaurantName })
                  }
                  className="grid h-8 w-8 place-items-center rounded-lg border border-brand/15 text-brand hover:bg-brand-pale"
                  aria-label="Ajouter un"
                >
                  <Plus size={15} />
                </button>
              </div>
              <span className="w-20 text-right font-display font-bold text-brand">
                {formatPrice(line.item.priceCents * line.quantity)}
              </span>
              <button
                onClick={() => remove(line.item.id)}
                className="grid h-8 w-8 place-items-center rounded-lg text-neutral-300 hover:bg-red-50 hover:text-red-600"
                aria-label="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* Checkout summary */}
      <div>
        <Card className="sticky top-24 space-y-4">
          <h2 className="font-display text-lg font-bold text-brand">Finaliser la commande</h2>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Adresse de livraison
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="12 rue de la République, 75001 Paris"
            />
          </div>

          <div className="border-t border-brand/10 pt-4">
            <div className="flex items-center justify-between text-sm text-neutral-500">
              <span>Sous-total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm text-neutral-500">
              <span>Livraison</span>
              <span className="text-brand">Offerte</span>
            </div>
            <div className="mt-3 flex items-center justify-between font-display text-xl font-extrabold text-brand">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {checkout.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {(checkout.error as Error).message}
            </p>
          )}

          <Button onClick={placeOrder} disabled={!canOrder} className="w-full">
            <CreditCard size={18} />
            {checkout.isPending ? 'Paiement en cours…' : `Payer ${formatPrice(total)}`}
          </Button>
          <p className="text-center text-xs text-neutral-400">
            Paiement Stripe en mode test — aucune carte réelle n'est débitée.
          </p>
        </Card>
      </div>
    </div>
  );
}
