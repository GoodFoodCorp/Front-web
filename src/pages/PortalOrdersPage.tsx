import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { useRestaurantOrders, useUpdateOrderStatus } from '../features/orders/hooks/useOrders';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/format';
import type { Order, OrderStatus } from '../features/orders/types/order.types';

// The next lifecycle step a franchisee can trigger for a given status.
const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  CONFIRMED: { status: 'IN_PREPARATION', label: 'Démarrer la préparation' },
  IN_PREPARATION: { status: 'READY_FOR_PICKUP', label: 'Marquer comme prête' },
};

export function PortalOrdersPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: orders, isLoading } = useRestaurantOrders(tenantId);

  if (isLoading) return <Spinner label="Chargement des commandes…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Commandes</h1>
        <p className="text-neutral-500">Gérez la préparation des commandes de votre restaurant</p>
      </div>

      {!orders || orders.length === 0 ? (
        <EmptyState icon="🍽️" title="Aucune commande" hint="Les commandes clients apparaîtront ici." />
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
  const next = NEXT[order.status];

  return (
    <Card className="flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-brand">#{order.id.slice(0, 8)}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {order.items.map((i) => `${i.quantity}× ${i.menu_item_name}`).join(', ')}
        </p>
      </div>
      <span className="font-display text-lg font-extrabold text-brand">
        {formatPrice(order.total_amount_cents)}
      </span>
      {next && (
        <Button
          disabled={update.isPending}
          onClick={() => update.mutate({ id: order.id, status: next.status })}
        >
          {next.label}
        </Button>
      )}
    </Card>
  );
}
