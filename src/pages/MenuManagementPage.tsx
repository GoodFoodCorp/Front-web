import { useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { LocationBadge } from '../components/LocationBadge';
import { Spinner } from '../components/Spinner';
import {
  useCreateMenuItem,
  useDeleteMenuItem,
  useMyMenu,
  useUpdateMenuItem,
} from '../features/catalog/hooks/useMenu';
import type { MenuItem, MenuItemForm } from '../features/catalog/types/menu.types';
import { formatPrice } from '../utils/format';
import { dishPhoto } from '../utils/images';

const ALL = 'Toutes les catégories';
const CATEGORY_OPTIONS = ['Burgers', 'Pizzas', 'Salades', 'Desserts', 'Boissons'];

const EMPTY_FORM: MenuItemForm = {
  name: '',
  description: '',
  price_cents: 0,
  category: 'Burgers',
  emoji: '🍔',
  available: true,
};

export function MenuManagementPage() {
  const { data: items, isLoading } = useMyMenu();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);

  const filtered = useMemo(() => {
    return (items ?? []).filter((item) => {
      const matchesCategory = category === ALL || item.category === category;
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, search, category]);

  if (isLoading) return <Spinner label="Chargement du menu…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Gestion des Plats</h1>
          <p className="text-neutral-500">Modifiez vos plats</p>
        </div>
        <LocationBadge />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            className="pl-9"
            placeholder="Rechercher un plat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
        >
          <option>{ALL}</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Button
          className="ml-auto"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          <Plus size={18} /> Ajouter un Plat
        </Button>
      </div>

      {creating && (
        <div className="rounded-2xl border border-brand/10 bg-white p-5">
          <MenuItemFormFields
            initial={EMPTY_FORM}
            submitLabel="Créer l'article"
            onCancel={() => setCreating(false)}
            onDone={() => setCreating(false)}
          />
        </div>
      )}

      {!items || items.length === 0 ? (
        <EmptyState icon="🍽️" title="Aucun article" hint="Ajoutez votre premier plat au menu." />
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Aucun résultat" hint="Essayez une autre recherche ou catégorie." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) =>
            editing?.id === item.id ? (
              <div key={item.id} className="rounded-2xl border border-brand/10 bg-white p-5 sm:col-span-2 lg:col-span-3">
                <MenuItemFormFields
                  itemId={item.id}
                  initial={{
                    name: item.name,
                    description: item.description,
                    price_cents: item.priceCents,
                    category: item.category,
                    emoji: item.emoji,
                    available: item.available,
                  }}
                  submitLabel="Enregistrer"
                  onCancel={() => setEditing(null)}
                  onDone={() => setEditing(null)}
                />
              </div>
            ) : (
              <MenuCard key={item.id} item={item} onEdit={() => setEditing(item)} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function MenuCard({ item, onEdit }: { item: MenuItem; onEdit: () => void }) {
  const remove = useDeleteMenuItem();
  return (
    <article className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
      <div className="relative h-40 bg-cover bg-center" style={{ backgroundImage: `url(${dishPhoto(item.name, item.category)})` }}>
        <span className="absolute right-3 top-3">
          <Badge tone={item.available ? 'green' : 'red'}>{item.available ? 'Actif' : 'Inactif'}</Badge>
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-brand">{item.name}</h3>
          <span className="shrink-0 font-display font-extrabold text-brand">{formatPrice(item.priceCents)}</span>
        </div>
        <Badge tone="gray">{item.category}</Badge>
        <p className="mt-2 text-sm text-neutral-500">{item.description}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" onClick={onEdit} className="flex-1 py-2 text-sm">
            <Pencil size={15} /> Modifier
          </Button>
          <button
            onClick={() => remove.mutate(item.id)}
            disabled={remove.isPending}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50"
            aria-label="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

function MenuItemFormFields({
  itemId,
  initial,
  submitLabel,
  onCancel,
  onDone,
}: {
  itemId?: string;
  initial: MenuItemForm;
  submitLabel: string;
  onCancel: () => void;
  onDone: () => void;
}) {
  const create = useCreateMenuItem();
  const update = useUpdateMenuItem();
  const [form, setForm] = useState({ ...initial, priceEuros: (initial.price_cents / 100).toString() });
  const pending = create.isPending || update.isPending;
  const error = (create.error ?? update.error) as Error | null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: MenuItemForm = {
      name: form.name,
      description: form.description,
      price_cents: Math.round(parseFloat(form.priceEuros || '0') * 100),
      category: form.category,
      emoji: form.emoji || '🍽️',
      available: form.available,
    };
    const onSuccess = () => onDone();
    if (itemId) update.mutate({ id: itemId, form: payload }, { onSuccess });
    else create.mutate(payload, { onSuccess });
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-12">
      <Input
        className="sm:col-span-4"
        placeholder="Nom du plat"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        className="sm:col-span-2"
        placeholder="Emoji"
        value={form.emoji}
        onChange={(e) => setForm({ ...form, emoji: e.target.value })}
      />
      <select
        className="sm:col-span-3 rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <Input
        className="sm:col-span-3"
        type="number"
        step="0.01"
        min="0"
        placeholder="Prix (€)"
        required
        value={form.priceEuros}
        onChange={(e) => setForm({ ...form, priceEuros: e.target.value })}
      />
      <Input
        className="sm:col-span-9"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <label className="sm:col-span-3 flex items-center gap-2 text-sm font-semibold text-neutral-600">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => setForm({ ...form, available: e.target.checked })}
        />
        Disponible
      </label>
      {error && (
        <p className="sm:col-span-12 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error.message}</p>
      )}
      <div className="flex gap-2 sm:col-span-12">
        <Button type="submit" disabled={pending}>
          {pending ? 'Enregistrement…' : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
