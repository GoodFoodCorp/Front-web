import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin, Truck } from 'lucide-react';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { useCancelOrder, useOrder } from '../features/orders/hooks/useOrders';
import type { OrderStatus } from '../features/orders/types/order.types';
import { Button } from '../components/Button';
import { DeliveryStatusBadge } from '../features/delivery/components/DeliveryStatusBadge';
import { useOrderDelivery, useRateDelivery } from '../features/delivery/hooks/useDelivery';
import { formatPrice } from '../utils/format';
import { CancelOrderDialog } from '../features/orders/components/CancelOrderDialog';
import { CANCELLED_BY, CUSTOMER_REASONS, reasonLabel } from '../features/orders/cancellation';

/** The customer may cancel until the kitchen starts cooking. */
const CANCELLABLE: OrderStatus[] = ['PLACED', 'PAYMENT_PENDING', 'CONFIRMED'];

function RateDelivery({ deliveryId, rating }: { deliveryId: string; rating: number | null }) {
  const rate = useRateDelivery();
  if (rating || rate.isSuccess) {
    return <p className="text-sm text-neutral-500">Merci pour votre note ({rating ?? rate.data?.rating}/5).</p>;
  }
  return (
    <div className="flex items-center gap-1 text-sm text-neutral-600">
      Noter la livraison :
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          disabled={rate.isPending}
          onClick={() => rate.mutate({ id: deliveryId, rating: n, comment: '' })}
          className="text-xl text-amber-400 hover:scale-110"
          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
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
  const justPaid = (location.state as { justPaid?: boolean } | null)?.justPaid;
  const { data: deliveryDetail } = useOrderDelivery(order?.id, !!order && order.status !== 'CANCELLED');

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
            <p className="text-sm text-brand/70">Votre commande a bien été transmise au restaurant.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand">
          Commande #{order.id.slice(0, 8)}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      {order.status !== 'CANCELLED' && (
        <Card>
          <div className="flex items-center justify-between">
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
          {delivery.status === 'DELIVERED' && <RateDelivery deliveryId={delivery._id} rating={delivery.rating ?? null} />}

          {delivery.status === 'DELIVERED' && delivery.deliveredAt ? (
            <p className="text-sm text-neutral-500">
              Livrée le {new Date(delivery.deliveredAt).toLocaleString('fr-FR')}
            </p>
          ) : (
            delivery.estimatedDeliveryTime &&
            delivery.status !== 'CANCELLED' && (
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

      <Card className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-neutral-600">
          <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
          <span>{order.fulfillment === 'PICKUP' ? 'À retirer au restaurant' : order.delivery_address}</span>
        </div>
        <div className="border-t border-brand/10 pt-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
              <span>
                <span className="font-semibold text-brand">{item.quantity}×</span> {item.menu_item_name}
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
