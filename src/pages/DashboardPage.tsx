import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Boxes, ScrollText, TrendingUp, Users } from 'lucide-react';
import { LocationBadge } from '../components/LocationBadge';
import { useStocks } from '../features/stock/hooks/useStock';
import { useRestaurantOrders } from '../features/orders/hooks/useOrders';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/format';
import { placeholderHeadcount } from '../utils/demoMetrics';
import type { Order } from '../features/orders/types/order.types';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

function lastSixMonths(orders: Order[]) {
  const now = new Date();
  const buckets: { key: string; label: string; revenue: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()], revenue: 0, count: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  orders.forEach((o) => {
    const d = new Date(o.placed_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = byKey.get(key);
    if (!bucket) return;
    bucket.count += 1;
    if (!['CANCELLED', 'PLACED', 'PAYMENT_PENDING'].includes(o.status)) {
      bucket.revenue += o.total_amount_cents / 100;
    }
  });
  return buckets;
}

export function DashboardPage() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const { data: stocks, isLoading: stocksLoading } = useStocks();
  const { data: orders } = useRestaurantOrders(tenantId);

  const monthly = useMemo(() => lastSixMonths(orders ?? []), [orders]);

  if (stocksLoading) return <LoadingDashboard />;

  const revenueCents = (orders ?? [])
    .filter((o) => !['CANCELLED', 'PLACED', 'PAYMENT_PENDING'].includes(o.status))
    .reduce((sum, o) => sum + o.total_amount_cents, 0);
  const ordersCount = orders?.length ?? 0;
  const avgBasket = ordersCount > 0 ? revenueCents / ordersCount : 0;
  const lowStock = stocks?.filter((s) => s.isBelowMinimum).length ?? 0;
  const headcount = placeholderHeadcount(tenantId);

  const stats = [
    { label: 'Total des ventes', value: formatPrice(revenueCents), icon: TrendingUp },
    { label: 'Total de commandes', value: String(ordersCount), icon: ScrollText },
    { label: "Prix moyen d'un panier", value: formatPrice(avgBasket), icon: TrendingUp },
    { label: 'Effectifs', value: String(headcount), hint: `${Math.round(headcount * 0.35)} en service`, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Tableau de bord</h1>
          <p className="text-neutral-500">Vue globale des performances de la franchise</p>
        </div>
        <LocationBadge />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon }, i) => (
          <div
            key={label}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-[rise_0.4s_both] rounded-2xl border border-brand/10 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm text-neutral-500">{label}</p>
              <Icon size={18} className="text-neutral-400" />
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold text-brand">{value}</p>
            {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand/10 bg-white p-5">
          <h2 className="font-display font-bold text-brand">Aperçu des ventes</h2>
          <p className="mb-4 text-sm text-neutral-400">Revenu mensuel pour les 6 derniers mois</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#00443014" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(2)} €`, 'Revenu']} />
              <Line type="monotone" dataKey="revenue" stroke="#004430" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-brand/10 bg-white p-5">
          <h2 className="font-display font-bold text-brand">Aperçu des commandes</h2>
          <p className="mb-4 text-sm text-neutral-400">Nombre de commandes par mois</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthly} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#00443014" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [String(v), 'Commandes']} />
              <Bar dataKey="count" fill="#ffcc00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
            <span className="font-display text-2xl font-extrabold text-brand">
              {orders?.filter((o) => ['CONFIRMED', 'IN_PREPARATION'].includes(o.status)).length ?? 0}
            </span>{' '}
            commande(s) en cours de traitement.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-neutral-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}
