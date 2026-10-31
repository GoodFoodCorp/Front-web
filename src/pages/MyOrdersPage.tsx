import { Link } from 'react-router-dom';
import { ChevronRight, ShoppingBag, Store, Truck } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { useMyOrders } from '../features/orders/hooks/useOrders';
import type { Order, OrderStatus } from '../features/orders/types/order.types';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { formatPrice, formatDateTime } from '../utils/format';
import { dishPhoto } from '../utils/images';

const FINISHED: OrderStatus[] = ['DELIVERED', 'CANCELLED'];
const AWAITING_PAYMENT: OrderStatus[] = ['PLACED', 'PAYMENT_PENDING'];

/** "2× Burger Deluxe, 1× Frites et 2 autres". */
function itemsSummary(order: Order, shown = 3): string {
  const parts = order.items.slice(0, shown).map((i) => `${i.quantity}× ${i.menu_item_name}`);
  const rest = order.items.length - shown;
  return rest > 0 ? `${parts.join(', ')} et ${rest} autre${rest > 1 ? 's' : ''}` : parts.join(', ');
}

export function MyOrdersPage() {
  const list = useMyOrders();
  const orders = list.data?.pages.flat();
  const isLoading = list.isLoading;
  const { data: restaurants } = useRestaurants();

  if (isLoading) return <Spinner label="Chargement de vos commandes…" />;
  if (!orders || orders.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <EmptyState icon="📦" title="Aucune commande" hint="Vos commandes apparaîtront ici." />
      </div>
    );
  }

  const restaurantName = (id: string) => restaurants?.find((r) => r.id === id)?.name ?? 'Restaurant';
  const ongoing = orders.filter((o) => !FINISHED.includes(o.status));
  const past = orders.filter((o) => FINISHED.includes(o.status));

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-brand">Mes commandes</h1>
      {ongoing.length > 0 && (
        <OrderSection title="En cours" orders={ongoing} restaurantName={restaurantName} />
      )}
      {past.length > 0 && <OrderSection title="Passées" orders={past} restaurantName={restaurantName} />}
      {list.hasNextPage && (
        <div className="text-center">
          <Button variant="ghost" disabled={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()}>
            {list.isFetchingNextPage ? 'Chargement…' : 'Afficher plus de commandes'}
          </Button>
        </div>
      )}
    </div>
  );
}

function OrderSection({
  title,
  orders,
  restaurantName,
}: {
  title: string;
  orders: Order[];
  restaurantName: (id: string) => string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">{title}</h2>
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} restaurant={restaurantName(order.restaurant_id)} />
      ))}
    </section>
  );
}

function OrderRow({ order, restaurant }: { order: Order; restaurant: string }) {
  const photos = order.items.slice(0, 3);
  return (
    <Link to={`/orders/${order.id}`} className="block">
      <Card className="flex items-center gap-3 p-4 transition hover:border-brand/30 hover:shadow-[var(--shadow-lift)] sm:gap-4">
        <div className="flex shrink-0 -space-x-6 sm:-space-x-3">
          {photos.map((item) => (
            <div
              key={item.id}
              className="h-12 w-12 rounded-xl border-2 border-white bg-cover bg-center shadow-sm sm:h-14 sm:w-14"
              style={{ backgroundImage: `url(${dishPhoto(item.menu_item_name)})` }}
              aria-hidden
            />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-display font-bold text-brand">
              <Store size={15} aria-hidden /> {restaurant}
            </span>
            <OrderStatusBadge status={order.status} />
            {AWAITING_PAYMENT.includes(order.status) && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-brand-dark">À payer</span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-neutral-700">{itemsSummary(order)}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
            {order.fulfillment === 'PICKUP' ? <ShoppingBag size={12} aria-hidden /> : <Truck size={12} aria-hidden />}
            {order.fulfillment === 'PICKUP' ? 'À emporter' : 'Livraison'} · {formatDateTime(order.placed_at)} · #
            {order.id.slice(0, 8)}
          </p>
        </div>
        <span className="shrink-0 font-display text-base font-extrabold text-brand sm:text-lg">{formatPrice(order.amount_due_cents)}</span>
        <ChevronRight size={18} className="hidden shrink-0 text-neutral-300 sm:block" aria-hidden />
      </Card>
    </Link>
  );
}
