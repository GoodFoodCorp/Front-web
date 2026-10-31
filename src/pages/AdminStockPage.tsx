import { useMemo, useState } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Spinner } from '../components/Spinner';
import { useAllRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { NEXT_STATUS, STATUS_META } from '../features/stock/replenishmentStatus';
import {
  useNetworkStocks,
  useReplenishments,
  useUpdateReplenishmentStatus,
} from '../features/stock/hooks/useStock';
import type { ReplenishmentRequest, StockItem } from '../features/stock/types/stock.types';

interface NetworkStockRow extends StockItem {
  restaurantName: string;
}

/** Head office: consolidated stock of the whole network + replenishment approvals. */
export function AdminStockPage() {
  const { data: restaurants, isLoading: loadingRestaurants } = useAllRestaurants();
  const restaurantList = restaurants ?? [];
  const stockQueries = useNetworkStocks(restaurantList.map((r) => r.id));
  const { data: requests } = useReplenishments();

  const [search, setSearch] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  const stocksLoading = stockQueries.some((q) => q.isLoading);
  const failedCount = stockQueries.filter((q) => q.isError).length;

  const rows: NetworkStockRow[] = useMemo(() => {
    const all: NetworkStockRow[] = [];
    restaurantList.forEach((restaurant, i) => {
      (stockQueries[i]?.data ?? []).forEach((item) =>
        all.push({ ...item, restaurantName: restaurant.name }),
      );
    });
    return all;
    // stockQueries is a new array each render; its data identities are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurants, ...stockQueries.map((q) => q.data)]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows
      .filter((r) => !restaurantId || r.tenantId === restaurantId)
      .filter((r) => !onlyAlerts || r.isBelowMinimum)
      .filter((r) => !term || r.name.toLowerCase().includes(term))
      .sort(
        (a, b) =>
          Number(b.isBelowMinimum) - Number(a.isBelowMinimum) ||
          a.restaurantName.localeCompare(b.restaurantName) ||
          a.name.localeCompare(b.name),
      );
  }, [rows, restaurantId, onlyAlerts, search]);

  if (loadingRestaurants) return <Spinner label="Chargement du réseau…" />;

  const alertCount = rows.filter((r) => r.isBelowMinimum).length;
  const restaurantsInAlert = new Set(rows.filter((r) => r.isBelowMinimum).map((r) => r.tenantId)).size;
  const pending = (requests ?? []).filter((r) => r.status === 'PENDING').length;

  const restaurantName = (id: string) => restaurantList.find((r) => r.id === id)?.name ?? '—';
  const itemName = (id: string) => rows.find((r) => r.id === id)?.name ?? id.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Gestion des stocks</h1>
        <p className="text-neutral-500">Vue consolidée des stocks du réseau</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Restaurants" value={String(restaurantList.length)} />
        <Kpi label="Articles suivis" value={String(rows.length)} />
        <Kpi
          label="Sous le seuil minimum"
          value={String(alertCount)}
          hint={alertCount > 0 ? `${restaurantsInAlert} restaurant${restaurantsInAlert > 1 ? 's' : ''} concerné${restaurantsInAlert > 1 ? 's' : ''}` : undefined}
          tone={alertCount > 0 ? 'text-red-600' : 'text-brand'}
        />
        <Kpi label="Réappros en attente" value={String(pending)} tone={pending > 0 ? 'text-accent-dark' : 'text-brand'} />
      </div>

      {failedCount > 0 && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Le stock de {failedCount} restaurant{failedCount > 1 ? 's' : ''} n'a pas pu être chargé.
        </p>
      )}

      <section className="rounded-2xl border border-brand/10 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-brand/10 px-5 py-4">
          <h2 className="mr-auto font-display font-bold text-brand">Inventaire du réseau</h2>
          <Input
            className="max-w-[220px]"
            placeholder="Rechercher un article…"
            aria-label="Rechercher un article"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            aria-label="Restaurant"
            className="w-64"
            value={restaurantId}
            onChange={setRestaurantId}
            options={[{ value: '', label: 'Tous les restaurants' }, ...restaurantList.map((r) => ({ value: r.id, label: r.name }))]}
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-700">
            <input type="checkbox" checked={onlyAlerts} onChange={(e) => setOnlyAlerts(e.target.checked)} />
            Alertes uniquement
          </label>
        </div>

        {stocksLoading ? (
          <div className="p-8">
            <Spinner label="Chargement des stocks…" />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={onlyAlerts ? '✅' : '📦'}
              title={onlyAlerts ? 'Aucune alerte de stock' : 'Aucun article'}
              hint={onlyAlerts ? 'Tous les stocks sont au-dessus de leur seuil minimum.' : 'Aucun article ne correspond à ces filtres.'}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-neutral-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Restaurant</th>
                  <th className="px-5 py-3 font-medium">Article</th>
                  <th className="px-5 py-3 font-medium">Niveau</th>
                  <th className="px-5 py-3 font-medium">Seuils (min / max)</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Mis à jour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/5">
                {visible.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3 text-neutral-600">{item.restaurantName}</td>
                    <td className="px-5 py-3 font-semibold text-brand">{item.name}</td>
                    <td className="px-5 py-3">
                      <LevelBar item={item} />
                    </td>
                    <td className="px-5 py-3 text-neutral-500">
                      {item.thresholdMin} / {item.thresholdMax} {item.unit}
                    </td>
                    <td className="px-5 py-3">
                      {item.isBelowMinimum ? (
                        <Badge tone="red">
                          <AlertTriangle size={12} className="mr-1" /> Stock faible
                        </Badge>
                      ) : (
                        <Badge tone="green">En stock</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-neutral-400">
                      {new Date(item.updatedAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-display text-xl font-bold text-brand">Demandes de réapprovisionnement</h2>
          <p className="text-sm text-neutral-500">
            Le siège valide chaque demande : approuvée, commandée, puis reçue.
          </p>
        </div>
        {!requests || requests.length === 0 ? (
          <EmptyState icon="🚚" title="Aucune demande" hint="Les demandes des restaurants apparaîtront ici." />
        ) : (
          <div className="space-y-3">
            {[...requests]
              .sort(
                (a, b) =>
                  Number(b.status === 'PENDING') - Number(a.status === 'PENDING') ||
                  b.requestedAt.localeCompare(a.requestedAt),
              )
              .map((req) => (
                <RequestRow
                  key={req.id}
                  req={req}
                  restaurant={restaurantName(req.tenantId)}
                  article={itemName(req.stockItemId)}
                />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, hint, tone = 'text-brand' }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`mt-2 font-display text-3xl font-extrabold ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function LevelBar({ item }: { item: StockItem }) {
  const pct = item.thresholdMax > 0 ? Math.min(100, Math.round((item.quantityOnHand / item.thresholdMax) * 100)) : 0;
  return (
    <div className="flex min-w-[150px] items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full ${item.isBelowMinimum ? 'bg-red-500' : 'bg-brand'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-24 shrink-0 text-right font-semibold text-neutral-700">
        {item.quantityOnHand} {item.unit}
      </span>
    </div>
  );
}

function RequestRow({ req, restaurant, article }: { req: ReplenishmentRequest; restaurant: string; article: string }) {
  const update = useUpdateReplenishmentStatus();
  const meta = STATUS_META[req.status];
  const next = NEXT_STATUS[req.status];

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand/10 bg-white p-5 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-brand">{article}</span>
          <span className="text-sm text-neutral-400">· {restaurant}</span>
          {req.isAutomatic && (
            <Badge tone="yellow">
              <Sparkles size={11} className="mr-1" /> Auto
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-neutral-500">
          Quantité demandée : <span className="font-semibold">{req.quantityRequested}</span> ·{' '}
          {new Date(req.requestedAt).toLocaleDateString('fr-FR')}
        </p>
      </div>

      <Badge tone={meta.tone}>{meta.label}</Badge>

      {next && (
        <Button
          variant="ghost"
          className="px-3 py-1.5"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: req.id, status: next })}
        >
          → {STATUS_META[next].label}
        </Button>
      )}
      {req.status === 'PENDING' && (
        <Button
          variant="danger"
          className="px-3 py-1.5"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: req.id, status: 'CANCELLED' })}
        >
          Refuser
        </Button>
      )}
    </div>
  );
}
