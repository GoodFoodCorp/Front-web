import { useState } from 'react';
import { Ban, Receipt, ScrollText, TrendingUp } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { StatTile } from '../components/StatTile';
import { PeriodPicker } from '../features/analytics/components/PeriodPicker';
import { OrdersTrendChart, RevenueTrendChart } from '../features/analytics/components/TrendChart';
import { TopList } from '../features/analytics/components/TopList';
import { useNetworkAnalytics } from '../features/analytics/hooks/useAnalytics';
import { formatCancellationRate, formatPrice } from '../utils/format';

/** Head office: the whole network, computed by analytics-service. */
export function AdminDashboardPage() {
  const [days, setDays] = useState(30);
  const { data: metrics, isLoading, isError, error } = useNetworkAnalytics(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Tableau de bord</h1>
          <p className="text-neutral-500">Vue globale du réseau de franchises</p>
        </div>
        <PeriodPicker days={days} onChange={setDays} />
      </div>

      {isLoading ? (
        <Spinner label="Calcul des indicateurs…" />
      ) : isError ? (
        <EmptyState icon="📊" title="Indicateurs indisponibles" hint={(error as Error).message} />
      ) : !metrics ? null : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile index={0} label="Chiffre d'affaires" value={formatPrice(metrics.revenueCents)} icon={TrendingUp} />
            <StatTile index={1} label="Commandes" value={String(metrics.ordersCount)} icon={ScrollText} />
            <StatTile index={2} label="Panier moyen" value={formatPrice(metrics.averageBasketCents)} icon={Receipt} />
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
              title="Top restaurants"
              subtitle="Par chiffre d'affaires sur la période"
              emptyIcon="🏪"
              emptyTitle="Aucune vente sur la période"
              rows={metrics.topRestaurants.map((r) => ({
                id: r.restaurantId,
                label: r.name,
                caption: formatPrice(r.revenueCents),
                value: r.revenueCents,
              }))}
            />
            <TopList
              title="Top plats"
              subtitle="Par quantité vendue sur la période"
              emptyIcon="🍽️"
              emptyTitle="Aucun plat vendu sur la période"
              rows={metrics.topDishes.map((d) => ({
                id: d.menuItemId,
                label: d.name,
                caption: `${d.quantity} vendus`,
                value: d.quantity,
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
}

