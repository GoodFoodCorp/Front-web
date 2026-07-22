import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import {
  useCreateMenuItem,
  useDeleteMenuItem,
  useMyMenu,
  useUpdateMenuItem,
} from '../features/catalog/hooks/useMenu';
import type { MenuItem, MenuItemForm } from '../features/catalog/types/menu.types';
import { formatPrice } from '../utils/format';

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

  if (isLoading) return <Spinner label="Chargement du menu…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Gestion des menus</h1>
          <p className="text-neutral-500">Les articles de votre restaurant, visibles par vos clients</p>
        </div>
        <Button
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          <Plus size={18} /> Nouvel article
        </Button>
      </div>

      {creating && (
        <MenuItemForm
          initial={EMPTY_FORM}
          submitLabel="Créer l'article"
          onCancel={() => setCreating(false)}
          onDone={() => setCreating(false)}
        />
      )}

      {!items || items.length === 0 ? (
        <EmptyState icon="🍽️" title="Aucun article" hint="Ajoutez votre premier plat au menu." />
      ) : (
        <div className="space-y-3">
          {items.map((item) =>
            editing?.id === item.id ? (
              <MenuItemForm
                key={item.id}
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
            ) : (
              <MenuRow key={item.id} item={item} onEdit={() => setEditing(item)} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function MenuRow({ item, onEdit }: { item: MenuItem; onEdit: () => void }) {
  const remove = useDeleteMenuItem();
  return (
    <Card className="flex items-center gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-pale text-2xl">
        {item.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-display font-bold text-brand">{item.name}</p>
          <Badge tone="gray">{item.category}</Badge>
          {!item.available && <Badge tone="red">Indisponible</Badge>}
        </div>
        <p className="truncate text-sm text-neutral-500">{item.description}</p>
      </div>
      <span className="font-display font-extrabold text-brand">{formatPrice(item.priceCents)}</span>
      <button
        onClick={onEdit}
        className="grid h-9 w-9 place-items-center rounded-lg border border-brand/15 text-brand hover:bg-brand-pale"
        aria-label="Modifier"
      >
        <Pencil size={16} />
      </button>
      <button
        onClick={() => remove.mutate(item.id)}
        disabled={remove.isPending}
        className="grid h-9 w-9 place-items-center rounded-lg text-neutral-300 hover:bg-red-50 hover:text-red-600"
        aria-label="Supprimer"
      >
        <Trash2 size={16} />
      </button>
    </Card>
  );
}

function MenuItemForm({
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
    <Card>
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
          {['Burgers', 'Pizzas', 'Salades', 'Desserts', 'Boissons'].map((c) => (
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
          <p className="sm:col-span-12 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error.message}
          </p>
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
    </Card>
  );
}
