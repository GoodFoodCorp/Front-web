import { useState } from 'react';
import { Bike, ShoppingBag } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { useCancelOrder, useRestaurantOrders, useUpdateOrderStatus } from '../features/orders/hooks/useOrders';
import { CancelOrderDialog } from '../features/orders/components/CancelOrderDialog';
import { CANCELLED_BY, reasonLabel, STAFF_REASONS } from '../features/orders/cancellation';
import { DeliveryStatusBadge } from '../features/delivery/components/DeliveryStatusBadge';
import { useOrderDelivery } from '../features/delivery/hooks/useDelivery';
import { useAuthStore } from '../store/authStore';
import { formatDateTime, formatPrice } from '../utils/format';
import type { Order, OrderStatus } from '../features/orders/types/order.types';

// Paid orders the kitchen works on; unpaid checkouts never reach it.
const ACTIVE: OrderStatus[] = ['CONFIRMED', 'IN_PREPARATION', 'READY_FOR_PICKUP', 'IN_DELIVERY'];
const DONE: OrderStatus[] = ['DELIVERED', 'CANCELLED'];

// Before the courier takes it, the restaurant can still refuse an order
// (stock-out, incident): the customer is refunded automatically.
const CANCELLABLE: OrderStatus[] = ['CONFIRMED', 'IN_PREPARATION', 'READY_FOR_PICKUP'];

/** The next step the restaurant triggers. A delivery is then the courier's;
 *  a pickup order is handed over at the counter by the restaurant. */
function nextStep(order: Order): { status: OrderStatus; label: string } | null {
  const pickup = order.fulfillment === 'PICKUP';
  switch (order.status) {
    case 'CONFIRMED':
      return { status: 'IN_PREPARATION', label: 'Démarrer la préparation' };
    case 'IN_PREPARATION':
      return { status: 'READY_FOR_PICKUP', label: pickup ? 'Prête au comptoir' : 'Prête pour le livreur' };
    case 'READY_FOR_PICKUP':
      return pickup ? { status: 'DELIVERED', label: 'Remise au client' } : null;
    default:
      return null;
  }
}

export function PortalOrdersPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [tab, setTab] = useState<'active' | 'done'>('active');
  const { data: orders, isLoading } = useRestaurantOrders(tenantId, tab === 'active' ? ACTIVE : DONE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Commandes</h1>
          <p className="text-neutral-500">Gérez la préparation des commandes de votre restaurant</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-white p-1 shadow-sm">
          {(['active', 'done'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-brand text-white' : 'text-neutral-500 hover:text-brand'}`}
            >
              {t === 'active' ? 'En cours' : 'Terminées'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Chargement des commandes…" />
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          icon="🍽️"
          title={tab === 'active' ? 'Aucune commande en cours' : 'Aucune commande terminée'}
          hint="Les commandes payées par vos clients apparaissent ici."
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const update = useUpdateOrderStatus();
  const cancel = useCancelOrder();
  const [refusing, setRefusing] = useState(false);
  const next = nextStep(order);
  const pickup = order.fulfillment === 'PICKUP';
  const tracked = !pickup && ['READY_FOR_PICKUP', 'IN_DELIVERY', 'DELIVERED'].includes(order.status);
  const { data: deliveryDetail } = useOrderDelivery(order.id, tracked);
  const notes = order.items.filter((i) => i.special_instructions);

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-brand">#{order.id.slice(0, 8)}</span>
            <OrderStatusBadge status={order.status} />
            <Badge tone={pickup ? 'yellow' : 'blue'}>
              <span className="inline-flex items-center gap-1">
                {pickup ? <ShoppingBag size={12} /> : <Bike size={12} />}
                {pickup ? 'À emporter' : 'Livraison'}
              </span>
            </Badge>
            {deliveryDetail && <DeliveryStatusBadge status={deliveryDetail.delivery.status} />}
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            {order.items.map((i) => `${i.quantity}× ${i.menu_item_name}`).join(', ')}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">
            {formatDateTime(order.placed_at)}
            {!pickup && order.delivery_address && ` · ${order.delivery_address}`}
            {order.tip_cents > 0 && ` · pourboire ${formatPrice(order.tip_cents)}`}
          </p>
          {notes.map((i) => (
            <p key={i.id} className="mt-1 rounded-lg bg-yellow-50 px-2 py-1 text-xs text-yellow-800">
              {i.menu_item_name} : {i.special_instructions}
            </p>
          ))}
        </div>
        <span className="font-display text-lg font-extrabold text-brand">{formatPrice(order.total_amount_cents)}</span>
        <div className="flex gap-2">
          {CANCELLABLE.includes(order.status) && (
            <Button
              variant="ghost"
              disabled={update.isPending}
              onClick={() => {
                cancel.reset();
                setRefusing(true);
              }}
            >
              Annuler
            </Button>
          )}
          {next && (
            <Button disabled={update.isPending} onClick={() => update.mutate({ id: order.id, status: next.status })}>
              {next.label}
            </Button>
          )}
        </div>
      </div>
      {update.isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{(update.error as Error).message}</p>
      )}

      {order.status === 'CANCELLED' && order.cancellation && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Annulée {CANCELLED_BY[order.cancellation.by]} : {reasonLabel(order.cancellation.reason)}
          {order.cancellation.comment && ` — « ${order.cancellation.comment} »`}
        </p>
      )}

      {refusing && (
        <CancelOrderDialog
          reasons={STAFF_REASONS}
          warning={`La commande #${order.id.slice(0, 8)} sera annulée et le client remboursé de ${formatPrice(order.amount_due_cents)}. Le motif lui est communiqué.`}
          pending={cancel.isPending}
          error={cancel.isError ? (cancel.error as Error).message : null}
          onClose={() => setRefusing(false)}
          onConfirm={(reason, comment) =>
            cancel.mutate({ id: order.id, reason, comment }, { onSuccess: () => setRefusing(false) })
          }
        />
      )}
    </Card>
  );
}
