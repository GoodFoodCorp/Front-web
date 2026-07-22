import { Boxes, ScrollText, TrendingUp, Truck } from 'lucide-react';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { useStocks, useReplenishments } from '../features/stock/hooks/useStock';
import { useRestaurantOrders } from '../features/orders/hooks/useOrders';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/format';

export function DashboardPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: stocks, isLoading: stocksLoading } = useStocks();
  const { data: replenishments } = useReplenishments();
  const { data: orders } = useRestaurantOrders(tenantId);

  if (stocksLoading) return <Spinner label="Chargement du tableau de bord…" />;

  const revenueCents = (orders ?? [])
    .filter((o) => !['CANCELLED', 'PLACED', 'PAYMENT_PENDING'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount_cents, 0);
  const ordersCount = orders?.length ?? 0;
  const avgBasket = ordersCount > 0 ? revenueCents / ordersCount : 0;
  const lowStock = stocks?.filter((s) => s.isBelowMinimum).length ?? 0;
  const pendingReplenishments = replenishments?.filter((r) => r.status === 'PENDING').length ?? 0;

  const stats = [
    { label: 'Chiffre d’affaires', value: formatPrice(revenueCents), icon: TrendingUp, tone: 'text-brand' },
    { label: 'Commandes', value: String(ordersCount), icon: ScrollText, tone: 'text-brand' },
    { label: 'Panier moyen', value: formatPrice(avgBasket), icon: TrendingUp, tone: 'text-brand' },
    {
      label: 'Articles sous seuil',
      value: String(lowStock),
      icon: Boxes,
      tone: lowStock > 0 ? 'text-red-600' : 'text-brand',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Tableau de bord</h1>
        <p className="text-neutral-500">Vue globale des performances de la franchise</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }, i) => (
          <Card key={label} className="animate-[rise_0.4s_both]">
            <div style={{ animationDelay: `${i * 60}ms` }} className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neutral-500">{label}</p>
                <p className={`mt-2 font-display text-3xl font-extrabold ${tone}`}>{value}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-pale text-brand">
                <Icon size={20} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Truck size={18} className="text-brand" />
            <h2 className="font-display font-bold text-brand">Réapprovisionnement</h2>
          </div>
          {pendingReplenishments > 0 ? (
            <p className="text-sm text-neutral-600">
              <span className="font-display text-2xl font-extrabold text-accent-dark">
                {pendingReplenishments}
              </span>{' '}
              demande{pendingReplenishments > 1 ? 's' : ''} en attente de traitement.
            </p>
          ) : (
            <p className="text-sm text-neutral-500">Aucune demande en attente. 👍</p>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <ScrollText size={18} className="text-brand" />
            <h2 className="font-display font-bold text-brand">Commandes à préparer</h2>
          </div>
          <p className="text-sm text-neutral-600">
            <span className="font-display text-2xl font-extrabold text-brand">
              {orders?.filter((o) => ['CONFIRMED', 'IN_PREPARATION'].includes(o.status)).length ?? 0}
            </span>{' '}
            commande(s) en cours de traitement.
          </p>
        </Card>
      </div>
    </div>
  );
}
