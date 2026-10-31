import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { StripeCardElement } from '@stripe/stripe-js';
import { ArrowLeft, CheckCircle2, Clock, CreditCard, FileText, MapPin, Store, Truck } from 'lucide-react';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { useCancelOrder, useOrder, usePayOrder } from '../features/orders/hooks/useOrders';
import type { OrderStatus } from '../features/orders/types/order.types';
import { Button } from '../components/Button';
import { DeliveryStatusBadge } from '../features/delivery/components/DeliveryStatusBadge';
import { useOrderDelivery, useRateDelivery } from '../features/delivery/hooks/useDelivery';
import { formatPrice } from '../utils/format';
import { dishPhoto } from '../utils/images';
import { useRestaurant } from '../features/restaurants/hooks/useRestaurants';
import { CancelOrderDialog } from '../features/orders/components/CancelOrderDialog';
import { CANCELLED_BY, CUSTOMER_REASONS, reasonLabel } from '../features/orders/cancellation';
import { LiveMap } from '../features/tracking/LiveMap';
import { formatEta, useLiveDelivery } from '../features/tracking/useLiveDelivery';
import { NEW_CARD, PaymentPicker } from '../features/payments/components/PaymentPicker';
import { usePaymentMethods } from '../features/payments/hooks/usePayments';
import { stripeEnabled } from '../services/stripe';
import { API_BASE_URL } from '../config/app.config';
import type { Delivery, DeliveryDetail } from '../features/delivery/types/delivery.types';
import type { Order } from '../features/orders/types/order.types';
import { ReviewOrderCard, StarPicker, Stars } from '../features/reviews';

/** A delivery exists once the kitchen has the order. */
const WITH_DELIVERY: OrderStatus[] = ['IN_PREPARATION', 'READY_FOR_PICKUP', 'IN_DELIVERY', 'DELIVERED'];
const AWAITING_PAYMENT: OrderStatus[] = ['PLACED', 'PAYMENT_PENDING'];
const ON_THE_WAY = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'];

/** Where the courier is, live, and when they arrive. */
function LiveTracking({ detail }: { detail: DeliveryDetail }) {
  const delivery: Delivery = detail.delivery;
  const live = useLiveDelivery(delivery._id, ON_THE_WAY.includes(delivery.status));
  const courier = live.position ?? detail.lastPosition;
  const pickedUp = live.phase ? live.phase === 'TO_CUSTOMER' : delivery.status !== 'ASSIGNED';
  const eta = formatEta(live.etaAt ?? delivery.estimatedDeliveryTime);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-neutral-700">
          {pickedUp ? 'Votre livreur arrive' : 'Votre livreur se rend au restaurant'}
        </span>
        {eta && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-pale px-3 py-1 font-semibold text-brand">
            <Clock size={14} /> {eta}
          </span>
        )}
      </div>
      <LiveMap
        restaurant={delivery.pickup}
        customer={delivery.dropoff}
        courier={courier}
        route={live.route}
        towards={pickedUp ? 'customer' : 'restaurant'}
      />
      {live.remainingKm !== undefined && (
        <p className="text-xs text-neutral-400">
          Encore {live.remainingKm.toString().replace('.', ',')} km par la route · position mise à jour en direct
        </p>
      )}
    </div>
  );
}

/** An order left unpaid: pay it here, with a saved card or a new one. */
function PayNow({ order }: { order: Order }) {
  const pay = usePayOrder();
  const { data: cards } = usePaymentMethods();
  const [choice, setChoice] = useState<string | null>(null);
  const [newCard, setNewCard] = useState<StripeCardElement | null>(null);
  const [complete, setComplete] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const fallback = cards?.find((c) => c.isDefault)?.id ?? cards?.[0]?.id ?? NEW_CARD;
  const value = choice ?? fallback;
  const useNew = value === NEW_CARD;
  const ready = !stripeEnabled || (useNew ? !!newCard && complete : !!value);

  return (
    <Card className="space-y-3 border-amber-200">
      <div className="flex items-center gap-2">
        <CreditCard size={18} className="text-brand" />
        <h2 className="font-display font-bold text-brand">Paiement en attente</h2>
      </div>
      <p className="text-sm text-neutral-500">Le restaurant reçoit la commande dès qu'elle est payée.</p>
      {stripeEnabled && cards && (
        <PaymentPicker
          cards={cards}
          value={value}
          onChange={setChoice}
          onNewCard={setNewCard}
          onNewCardComplete={setComplete}
          saveCard={saveCard}
          onSaveCardChange={setSaveCard}
        />
      )}
      {pay.isError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{(pay.error as Error).message}</p>}
      <Button
        variant="accent"
        className="w-full py-3"
        disabled={!ready || pay.isPending}
        onClick={() =>
          pay.mutate({
            orderId: order.id,
            paymentMethodId: useNew ? undefined : value,
            newCard: useNew ? (newCard ?? undefined) : undefined,
            saveCard: useNew && saveCard,
          })
        }
      >
        {pay.isPending ? 'Paiement en cours…' : `Payer ${formatPrice(order.amount_due_cents)}`}
      </Button>
    </Card>
  );
}

/** The customer may cancel until the kitchen starts cooking. */
const CANCELLABLE: OrderStatus[] = ['PLACED', 'PAYMENT_PENDING', 'CONFIRMED'];

/** Once delivered, the customer rates the courier: stars only, sent on confirmation. */
function RateCourierCard({ delivery }: { delivery: Delivery }) {
  const rate = useRateDelivery();
  const [rating, setRating] = useState(0);
  const given = delivery.rating ?? rate.data?.rating ?? null;

  if (given) {
    return (
      <Card className="space-y-2">
        <h2 className="font-display font-bold text-brand">Votre note pour le livreur</h2>
        <Stars value={given} size={18} />
        <p className="text-xs text-neutral-400">Merci, votre note aide les livreurs à s’améliorer.</p>
      </Card>
    );
  }
  return (
    <Card>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (rating) rate.mutate({ id: delivery._id, rating });
        }}
      >
        <div>
          <h2 className="font-display font-bold text-brand">Comment s’est passée la livraison ?</h2>
          <p className="text-sm text-neutral-500">Notez votre livreur : ponctualité, soin, amabilité.</p>
        </div>
        <StarPicker name={`courier-${delivery._id}`} value={rating} onChange={setRating} legend="Note du livreur" />
        {rate.isError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {(rate.error as Error).message}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-sm text-xs text-neutral-400">Le livreur voit seulement sa note moyenne, pas la vôtre.</p>
          <Button type="submit" disabled={!rating || rate.isPending}>
            {rate.isPending ? 'Envoi…' : 'Envoyer ma note'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

const TIMELINE: OrderStatus[] = [
  'CONFIRMED',
  'IN_PREPARATION',
  'READY_FOR_PICKUP',
  'IN_DELIVERY',
  'DELIVERED',
];

const TIMELINE_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmée',
  IN_PREPARATION: 'En préparation',
  READY_FOR_PICKUP: 'Prête',
  IN_DELIVERY: 'En livraison',
  DELIVERED: 'Livrée',
};

export function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { data: order, isLoading } = useOrder(id);
  const cancel = useCancelOrder();
  const [cancelling, setCancelling] = useState(false);
  const state = location.state as { justPaid?: boolean; cardSaved?: boolean } | null;
  const justPaid = state?.justPaid;
  const { data: deliveryDetail } = useOrderDelivery(
    order?.id,
    !!order && order.fulfillment !== 'PICKUP' && WITH_DELIVERY.includes(order.status),
  );
  const { data: restaurant } = useRestaurant(order?.restaurant_id);

  if (isLoading) return <Spinner label="Chargement…" />;
  if (!order) return <p className="text-neutral-500">Commande introuvable.</p>;

  const currentIndex = TIMELINE.indexOf(order.status);
  const delivery = deliveryDetail?.delivery;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Mes commandes
      </Link>

      {justPaid && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-pale p-4 text-brand">
          <CheckCircle2 size={22} />
          <div>
            <p className="font-display font-bold">Paiement confirmé !</p>
            <p className="text-sm text-brand/70">
              Votre commande a bien été transmise au restaurant. La facture vous est envoyée par email.
              {state?.cardSaved === true && ' Votre carte est enregistrée pour vos prochaines commandes.'}
              {state?.cardSaved === false && " Votre carte n'a pas pu être enregistrée : ajoutez-la depuis votre profil."}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand">
            Commande #{order.id.slice(0, 8)}
          </h1>
          <Link
            to={`/restaurants/${order.restaurant_id}`}
            className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-brand"
          >
            <Store size={15} aria-hidden /> {restaurant?.name ?? 'Restaurant'}
            {restaurant?.city && <span className="font-normal text-neutral-400">· {restaurant.city}</span>}
          </Link>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {AWAITING_PAYMENT.includes(order.status) && <PayNow order={order} />}

      {/* Timeline */}
      {order.status !== 'CANCELLED' && (
        <Card>
          <div className="flex items-start justify-between">
            {TIMELINE.map((step, i) => {
              const done = currentIndex >= i;
              return (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {i > 0 && (
                      <div className={`h-1 flex-1 ${currentIndex >= i ? 'bg-brand' : 'bg-neutral-200'}`} />
                    )}
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        done ? 'bg-brand text-white' : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div
                        className={`h-1 flex-1 ${currentIndex > i ? 'bg-brand' : 'bg-neutral-200'}`}
                      />
                    )}
                  </div>
                  <span className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
                    {TIMELINE_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {delivery && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-brand" />
              <h2 className="font-display font-bold text-brand">Livraison</h2>
            </div>
            <DeliveryStatusBadge status={delivery.status} />
          </div>

          {deliveryDetail?.handoverCode && delivery.status !== 'DELIVERED' && delivery.status !== 'CANCELLED' && (
            <div className="rounded-xl bg-brand-pale px-4 py-3 text-sm text-brand">
              Code à donner au livreur :{' '}
              <span className="font-display text-xl font-extrabold tracking-widest">{deliveryDetail.handoverCode}</span>
            </div>
          )}
          {delivery.status === 'UNASSIGNED' && (
            <p className="text-sm text-neutral-500">Nous cherchons un livreur près du restaurant…</p>
          )}
          {deliveryDetail && ON_THE_WAY.includes(delivery.status) && <LiveTracking detail={deliveryDetail} />}

          {delivery.status === 'DELIVERED' && delivery.deliveredAt ? (
            <p className="text-sm text-neutral-500">
              Livrée le {new Date(delivery.deliveredAt).toLocaleString('fr-FR')}
            </p>
          ) : (
            delivery.estimatedDeliveryTime &&
            delivery.status === 'UNASSIGNED' && (
              <p className="text-sm text-neutral-500">
                Arrivée estimée vers{' '}
                {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )
          )}
        </Card>
      )}

      {order.status === 'DELIVERED' && (
        <ReviewOrderCard orderId={order.id} restaurantName={restaurant?.name ?? 'le restaurant'} />
      )}
      {order.status === 'DELIVERED' && delivery?.status === 'DELIVERED' && <RateCourierCard delivery={delivery} />}

      <Card className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-neutral-600">
          <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
          <span>{order.fulfillment === 'PICKUP' ? 'À retirer au restaurant' : order.delivery_address}</span>
        </div>
        <div className="border-t border-brand/10 pt-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-1.5 text-sm">
              <span className="flex items-center gap-3">
                <span
                  className="h-10 w-10 shrink-0 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${dishPhoto(item.menu_item_name)})` }}
                  aria-hidden
                />
                <span>
                  <span className="font-semibold text-brand">{item.quantity}×</span> {item.menu_item_name}
                </span>
              </span>
              <span className="text-neutral-500">
                {formatPrice(item.unit_price_cents * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 border-t border-brand/10 pt-3 text-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span>Sous-total</span>
            <span>{formatPrice(order.total_amount_cents)}</span>
          </div>
          {!!order.discount_cents && (
            <div className="flex items-center justify-between text-brand">
              <span>Réduction{order.promo_code ? ` (${order.promo_code})` : ''}</span>
              <span>−{formatPrice(order.discount_cents)}</span>
            </div>
          )}
          {!!order.delivery_fee_cents && (
            <div className="flex items-center justify-between text-neutral-500">
              <span>Frais de livraison</span>
              <span>{formatPrice(order.delivery_fee_cents)}</span>
            </div>
          )}
          {!!order.tip_cents && (
            <div className="flex items-center justify-between text-neutral-500">
              <span>Pourboire</span>
              <span>{formatPrice(order.tip_cents)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-brand/10 pt-3 font-display text-lg font-extrabold text-brand">
          <span>Total</span>
          <span>{formatPrice(order.amount_due_cents)}</span>
        </div>
        {order.confirmed_at && (
          <a
            href={`${API_BASE_URL}/api/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <FileText size={15} /> Voir la facture
          </a>
        )}
        {order.status === 'CANCELLED' && order.cancellation && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">
              Commande annulée {CANCELLED_BY[order.cancellation.by]} : {reasonLabel(order.cancellation.reason)}
            </p>
            {order.cancellation.comment && <p className="mt-1">« {order.cancellation.comment} »</p>}
            <p className="mt-1 text-xs text-red-600/80">Si elle était payée, elle vous est remboursée.</p>
          </div>
        )}
        {CANCELLABLE.includes(order.status) && (
          <div className="border-t border-brand/10 pt-3">
            <Button
              variant="ghost"
              onClick={() => {
                cancel.reset();
                setCancelling(true);
              }}
            >
              Annuler la commande
            </Button>
            <p className="mt-1 text-xs text-neutral-400">Une commande payée est remboursée.</p>
          </div>
        )}
        {cancelling && (
          <CancelOrderDialog
            reasons={CUSTOMER_REASONS}
            warning="Le restaurant n’a pas encore commencé : vous serez remboursé intégralement."
            pending={cancel.isPending}
            error={cancel.isError ? (cancel.error as Error).message : null}
            onClose={() => setCancelling(false)}
            onConfirm={(reason, comment) =>
              cancel.mutate({ id: order.id, reason, comment }, { onSuccess: () => setCancelling(false) })
            }
          />
        )}
      </Card>
    </div>
  );
}
