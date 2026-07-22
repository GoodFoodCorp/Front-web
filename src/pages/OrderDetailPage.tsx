import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { OrderStatusBadge } from '../features/orders/components/OrderStatusBadge';
import { useOrder } from '../features/orders/hooks/useOrders';
import type { OrderStatus } from '../features/orders/types/order.types';
import { formatPrice } from '../utils/format';

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
  const justPaid = (location.state as { justPaid?: boolean } | null)?.justPaid;

  if (isLoading) return <Spinner label="Chargement…" />;
  if (!order) return <p className="text-neutral-500">Commande introuvable.</p>;

  const currentIndex = TIMELINE.indexOf(order.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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

      <Card className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-neutral-600">
          <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
          <span>{order.delivery_address}</span>
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
        <div className="flex items-center justify-between border-t border-brand/10 pt-3 font-display text-lg font-extrabold text-brand">
          <span>Total</span>
          <span>{formatPrice(order.total_amount_cents)}</span>
        </div>
      </Card>
    </div>
  );
}
