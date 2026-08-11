import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { useMyOrders } from '../features/orders/hooks/useOrders';
import { formatPrice, formatDateTime } from '../utils/format';

export function MyOrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  if (isLoading) return <Spinner label="Chargement de vos commandes…" />;
  if (!orders || orders.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyState icon="📦" title="Aucune commande" hint="Vos commandes apparaîtront ici." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-5 font-display text-2xl font-bold text-brand">Mes commandes</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`}>
            <Card className="flex items-center gap-4 transition hover:border-brand/30 hover:shadow-[var(--shadow-lift)]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-brand">
                    Commande #{order.id.slice(0, 8)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {order.items.length} article{order.items.length > 1 ? 's' : ''} ·{' '}
                  {formatDateTime(order.placed_at)}
                </p>
              </div>
              <span className="font-display text-lg font-extrabold text-brand">
                {formatPrice(order.total_amount_cents)}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
