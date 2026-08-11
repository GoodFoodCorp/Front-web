import { useMemo, useState } from 'react';
import { Mail, MapPin, Phone, Plus, Star, Users } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { useAllRestaurants, useCreateRestaurant, useUpdateRestaurant } from '../features/restaurants/hooks/useRestaurants';
import type { Restaurant } from '../features/restaurants/types/restaurant.types';
import { demoMetricsFor } from '../utils/demoMetrics';
import { formatPrice } from '../utils/format';
import { restaurantPhoto } from '../utils/images';

const STATUS_FILTERS = ['Tous les statuts', 'Actif', 'Inactif'] as const;

export function AdminFranchisesPage() {
  const { data: restaurants, isLoading } = useAllRestaurants();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('Tous les statuts');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);

  const filtered = useMemo(() => {
    return (restaurants ?? []).filter((r) => {
      const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        status === 'Tous les statuts' || (status === 'Actif' ? r.isActive : !r.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [restaurants, search, status]);

  if (isLoading) return <Spinner label="Chargement des franchisés…" />;

  const total = restaurants?.length ?? 0;
  const active = restaurants?.filter((r) => r.isActive).length ?? 0;
  const inactive = total - active;
  const totalRevenueCents = (restaurants ?? []).reduce(
    (sum, r) => sum + demoMetricsFor(r.id).monthlyRevenueCents,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Gestion des Franchisés</h1>
        <p className="text-neutral-500">Gérer les franchises et leurs propriétaires</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Franchisés" value={String(total)} />
        <StatCard label="Actifs" value={String(active)} tone="text-brand" />
        <StatCard label="Inactifs" value={String(inactive)} tone={inactive > 0 ? 'text-neutral-500' : 'text-brand'} />
        <StatCard label="Revenu Total Mensuel (estimé)" value={formatPrice(totalRevenueCents)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          placeholder="Rechercher un franchisé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof STATUS_FILTERS)[number])}
          className="rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Button
          className="ml-auto"
          onClick={() => {
            setCreating((v) => !v);
            setEditing(null);
          }}
        >
          <Plus size={18} /> Ajouter un Franchisé
        </Button>
      </div>

      {creating && (
        <div className="rounded-2xl border border-brand/10 bg-white p-5">
          <RestaurantCreateForm onDone={() => setCreating(false)} onCancel={() => setCreating(false)} />
        </div>
      )}

      {!restaurants || restaurants.length === 0 ? (
        <EmptyState icon="🏪" title="Aucun franchisé" hint="Ajoutez votre premier restaurant." />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Aucun résultat" hint="Essayez une autre recherche ou un autre statut." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) =>
            editing?.id === r.id ? (
              <div key={r.id} className="rounded-2xl border border-brand/10 bg-white p-5 sm:col-span-2 lg:col-span-3">
                <RestaurantEditForm restaurant={r} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <FranchiseCard key={r.id} restaurant={r} index={i} onEdit={() => setEditing(r)} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone = 'text-brand' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`mt-2 font-display text-3xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}

function FranchiseCard({ restaurant, index, onEdit }: { restaurant: Restaurant; index: number; onEdit: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const metrics = demoMetricsFor(restaurant.id);

  return (
    <article className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
      <div className="relative h-36 bg-cover bg-center" style={{ backgroundImage: `url(${restaurantPhoto(index)})` }}>
        <span className="absolute right-3 top-3">
          <Badge tone={restaurant.isActive ? 'green' : 'gray'}>{restaurant.isActive ? 'Actif' : 'Inactif'}</Badge>
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-brand">{restaurant.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-neutral-500">
            <Star size={13} className="fill-accent text-accent" /> {metrics.rating}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
          <MapPin size={13} className="shrink-0" /> {restaurant.address}, {restaurant.city}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-brand/10 pt-3 text-sm">
          <div>
            <p className="text-xs text-neutral-400">Revenu mensuel (estimé)</p>
            <p className="font-display font-bold text-brand">{formatPrice(metrics.monthlyRevenueCents)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Commandes/mois (estimé)</p>
            <p className="font-display font-bold text-brand">{metrics.ordersPerMonth}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Personnel (estimé)</p>
            <p className="flex items-center gap-1 font-display font-bold text-brand">
              <Users size={13} /> {metrics.staffCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Plan</p>
            <p className="font-display font-bold text-brand capitalize">{restaurant.plan || '—'}</p>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 space-y-1 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-500">
            <p>
              <Phone size={11} className="mr-1 inline" /> Contact non renseigné
            </p>
            <p>
              <Mail size={11} className="mr-1 inline" /> Contact non renseigné
            </p>
            <p>Ouverture (estimée) : {new Date(metrics.openedAt).toLocaleDateString('fr-FR')}</p>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={onEdit} className="flex-1 py-2 text-sm">
            Modifier
          </Button>
          <Button variant="ghost" onClick={() => setShowDetails((v) => !v)} className="flex-1 py-2 text-sm">
            Détails
          </Button>
        </div>
      </div>
    </article>
  );
}

function RestaurantCreateForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const create = useCreateRestaurant();
  const [form, setForm] = useState({ name: '', slug: '', address: '', city: '', plan: 'standard' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-12">
      <Input
        className="sm:col-span-4"
        placeholder="Nom (ex. Good Food Nice)"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        className="sm:col-span-3"
        placeholder="Slug (ex. good-food-nice)"
        required
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
      />
      <Input
        className="sm:col-span-3"
        placeholder="Plan"
        value={form.plan}
        onChange={(e) => setForm({ ...form, plan: e.target.value })}
      />
      <Input
        className="sm:col-span-6"
        placeholder="Adresse"
        required
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <Input
        className="sm:col-span-6"
        placeholder="Ville"
        required
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
      />
      {create.isError && (
        <p className="sm:col-span-12 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {(create.error as Error).message}
        </p>
      )}
      <div className="flex gap-2 sm:col-span-12">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Création…' : 'Créer le franchisé'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

function RestaurantEditForm({
  restaurant,
  onDone,
  onCancel,
}: {
  restaurant: Restaurant;
  onDone: () => void;
  onCancel: () => void;
}) {
  const update = useUpdateRestaurant();
  const [form, setForm] = useState({
    name: restaurant.name,
    address: restaurant.address,
    city: restaurant.city,
    isActive: restaurant.isActive,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ id: restaurant.id, form }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-12">
      <Input
        className="sm:col-span-4"
        placeholder="Nom"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        className="sm:col-span-4"
        placeholder="Adresse"
        required
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <Input
        className="sm:col-span-3"
        placeholder="Ville"
        required
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
      />
      <label className="flex items-center gap-2 text-sm font-semibold text-neutral-600 sm:col-span-1">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Actif
      </label>
      {update.isError && (
        <p className="sm:col-span-12 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {(update.error as Error).message}
        </p>
      )}
      <div className="flex gap-2 sm:col-span-12">
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
