import { useState } from 'react';
import { Ban, Boxes, Receipt, ScrollText, TrendingUp } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { LocationBadge } from '../components/LocationBadge';
import { Spinner } from '../components/Spinner';
import { StatTile } from '../components/StatTile';
import { PeriodPicker } from '../features/analytics/components/PeriodPicker';
import { OrdersTrendChart, RevenueTrendChart } from '../features/analytics/components/TrendChart';
import { TopList } from '../features/analytics/components/TopList';
import { useRestaurantAnalytics } from '../features/analytics/hooks/useAnalytics';
import { useStocks } from '../features/stock/hooks/useStock';
import { formatCancellationRate, formatPrice } from '../utils/format';

/** Orders the kitchen still has to handle. */
const IN_PROGRESS_STATUSES = ['CONFIRMED', 'IN_PREPARATION'];

/** Franchisee: their own restaurant only — the tenant comes from the JWT, so
 *  no restaurant id is ever sent from the browser. */
export function DashboardPage() {
  const [days, setDays] = useState(30);
  const { data: metrics, isLoading, isError, error } = useRestaurantAnalytics(days);
  const { data: stocks } = useStocks();

  const lowStock = stocks?.filter((s) => s.isBelowMinimum).length ?? 0;
  const inProgress = metrics
    ? IN_PROGRESS_STATUSES.reduce((sum, status) => sum + (metrics.ordersByStatus[status] ?? 0), 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Tableau de bord</h1>
          <p className="text-neutral-500">Vue globale des performances de la franchise</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PeriodPicker days={days} onChange={setDays} />
          <LocationBadge />
        </div>
      </div>

      {isLoading ? (
        <Spinner label="Calcul des indicateurs…" />
      ) : isError ? (
        <EmptyState icon="📊" title="Indicateurs indisponibles" hint={(error as Error).message} />
      ) : !metrics ? null : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile index={0} label="Total des ventes" value={formatPrice(metrics.revenueCents)} icon={TrendingUp} />
            <StatTile index={1} label="Total de commandes" value={String(metrics.ordersCount)} icon={ScrollText} />
            <StatTile
              index={2}
              label="Prix moyen d'un panier"
              value={formatPrice(metrics.averageBasketCents)}
              icon={Receipt}
            />
            <StatTile
              index={3}
              label="Commandes annulées"
              value={String(metrics.cancelledCount)}
              hint={formatCancellationRate(metrics.cancelledCount, metrics.ordersCount)}
              icon={Ban}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RevenueTrendChart points={metrics.revenueByDay} />
            <OrdersTrendChart points={metrics.revenueByDay} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TopList
              title="Top plats"
              subtitle="Vos plats les plus vendus sur la période"
              emptyIcon="🍽️"
              emptyTitle="Aucun plat vendu sur la période"
              rows={metrics.topDishes.map((d) => ({
                id: d.menuItemId,
                label: d.name,
                caption: `${d.quantity} vendus`,
                value: d.quantity,
              }))}
            />

            <div className="space-y-4">
              <div className="rounded-2xl border border-brand/10 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Boxes size={18} className="text-brand" />
                  <h2 className="font-display font-bold text-brand">Stock</h2>
                </div>
                {lowStock > 0 ? (
                  <p className="text-sm text-neutral-600">
                    <span className="font-display text-2xl font-extrabold text-red-600">{lowStock}</span> article
                    {lowStock > 1 ? 's' : ''} sous le seuil minimum.
                  </p>
                ) : (
                  <p className="text-sm text-neutral-500">Tous les stocks sont au-dessus du seuil. 👍</p>
                )}
              </div>

              <div className="rounded-2xl border border-brand/10 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ScrollText size={18} className="text-brand" />
                  <h2 className="font-display font-bold text-brand">Commandes à préparer</h2>
                </div>
                <p className="text-sm text-neutral-600">
                  <span className="font-display text-2xl font-extrabold text-brand">{inProgress}</span> commande(s) en
                  cours de traitement.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
