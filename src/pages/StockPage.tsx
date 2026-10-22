import { useState } from 'react';
import { AlertTriangle, Check, Plus, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { LocationBadge } from '../components/LocationBadge';
import { Spinner } from '../components/Spinner';
import {
  useCreateReplenishment,
  useCreateStock,
  useDeleteStock,
  useRegisterMovement,
  useStockUsage,
  useStocks,
  useUpdateStock,
} from '../features/stock/hooks/useStock';
import type { StockItem, StockUsage } from '../features/stock/types/stock.types';

export function StockPage() {
  const { data: stocks, isLoading } = useStocks();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) return <Spinner label="Chargement des stocks…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Gestion des stocks</h1>
          <p className="text-neutral-500">Gérer les stocks d'ingrédients et fournitures</p>
        </div>
        <LocationBadge />
      </div>

      <div className="rounded-2xl border border-brand/10 bg-white">
        <div className="flex items-center justify-between border-b border-brand/10 px-5 py-4">
          <h2 className="font-display font-bold text-brand">Inventaire</h2>
          <Button onClick={() => setShowCreate((v) => !v)} className="px-4 py-2">
            <Plus size={16} /> Ajouter
          </Button>
        </div>

        {showCreate && (
          <div className="border-b border-brand/10 p-5">
            <CreateStockForm onDone={() => setShowCreate(false)} />
          </div>
        )}

        {!stocks || stocks.length === 0 ? (
          <div className="p-8">
            <EmptyState icon="📦" title="Aucun article en stock" hint="Créez votre premier article." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-neutral-400">
                <tr>
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">Quantités</th>
                  <th className="px-5 py-3 font-medium">Unités</th>
                  <th className="px-5 py-3 font-medium">Recommande à</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/5">
                {stocks.map((item) => (
                  <StockRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StockRow({ item }: { item: StockItem }) {
  const movement = useRegisterMovement();
  const replenish = useCreateReplenishment();
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState('');
  const [ordered, setOrdered] = useState(false);

  const apply = (type: 'IN' | 'OUT') => {
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) return;
    movement.mutate(
      { id: item.id, payload: { type, quantity, reason: type === 'IN' ? 'Réception' : 'Service' } },
      { onSuccess: () => setQty('') },
    );
  };

  const order = () => {
    const suggested = Math.max(item.thresholdMax - item.quantityOnHand, item.thresholdMin);
    replenish.mutate(
      { stockItemId: item.id, quantity: suggested },
      { onSuccess: () => setOrdered(true) },
    );
  };

  return (
    <>
      <tr className="hover:bg-neutral-50">
        <td className="px-5 py-3 font-semibold text-brand">{item.name}</td>
        <td className="px-5 py-3">{item.quantityOnHand}</td>
        <td className="px-5 py-3 text-neutral-500">{item.unit}</td>
        <td className="px-5 py-3 text-neutral-500">{item.thresholdMin}</td>
        <td className="px-5 py-3">
          {item.isBelowMinimum ? (
            <Badge tone="red">
              <AlertTriangle size={12} className="mr-1" /> Stock faible
            </Badge>
          ) : (
            <Badge tone="green">En Stock</Badge>
          )}
        </td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing((v) => !v)} className="px-3 py-1.5 text-xs">
              Modifier
            </Button>
            <Button
              variant="ghost"
              onClick={order}
              disabled={replenish.isPending || ordered}
              className="border-accent-dark px-3 py-1.5 text-xs text-accent-dark hover:bg-accent/10"
            >
              {ordered ? (
                <>
                  <Check size={13} /> Demandé
                </>
              ) : (
                'Commander'
              )}
            </Button>
          </div>
        </td>
      </tr>
      {editing && (
        <tr className="bg-neutral-50">
          <td colSpan={6} className="space-y-4 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">Mouvement de stock :</span>
              <input
                type="number"
                min="0"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Qté"
                className="w-20 rounded-lg border border-brand/15 px-2 py-1.5 text-sm outline-none focus:border-brand"
              />
              <Button variant="ghost" onClick={() => apply('IN')} className="px-3 py-1.5 text-xs" disabled={movement.isPending}>
                + Entrée
              </Button>
              <Button variant="accent" onClick={() => apply('OUT')} className="px-3 py-1.5 text-xs" disabled={movement.isPending}>
                − Sortie
              </Button>
            </div>
            <EditStockForm item={item} onClose={() => setEditing(false)} />
          </td>
        </tr>
      )}
    </>
  );
}

function CreateStockForm({ onDone }: { onDone: () => void }) {
  const create = useCreateStock();
  const [form, setForm] = useState({ name: '', unit: 'kg', quantityOnHand: '', thresholdMin: '', thresholdMax: '' });

  const [formError, setFormError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = validateStockForm(form);
    setFormError(invalid);
    if (invalid) return;
    create.mutate(
      {
        name: form.name,
        unit: form.unit,
        quantityOnHand: Number(form.quantityOnHand),
        thresholdMin: Number(form.thresholdMin),
        thresholdMax: Number(form.thresholdMax),
      },
      { onSuccess: onDone },
    );
  };

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-6">
      <Input
        className="sm:col-span-2"
        placeholder="Nom (ex. Tomates)"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input placeholder="Unité" required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
      <Input type="number" placeholder="Qté" required value={form.quantityOnHand} onChange={(e) => setForm({ ...form, quantityOnHand: e.target.value })} />
      <Input type="number" placeholder="Seuil min" required value={form.thresholdMin} onChange={(e) => setForm({ ...form, thresholdMin: e.target.value })} />
      <Input type="number" placeholder="Seuil max" required value={form.thresholdMax} onChange={(e) => setForm({ ...form, thresholdMax: e.target.value })} />
      {(formError || create.isError) && (
        <p className="sm:col-span-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {formError ?? stockErrorMessage(create.error as Error)}
        </p>
      )}
      <div className="flex gap-2 sm:col-span-6">
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Création…' : "Créer l'article"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

/** French message for a stock form that cannot be saved, or null when it is fine. */
function validateStockForm(form: { name: string; unit: string; quantityOnHand: string; thresholdMin: string; thresholdMax: string }): string | null {
  const min = Number(form.thresholdMin);
  const max = Number(form.thresholdMax);
  if (Number(form.quantityOnHand) < 0 || min < 0 || max < 0) return 'Les quantités et les seuils ne peuvent pas être négatifs.';
  if (max <= min) {
    return `Le seuil max (${form.thresholdMax}) doit être supérieur au seuil min « Recommande à » (${form.thresholdMin}).`;
  }
  return null;
}

/** The stock API answers in English: translate the messages a manager can hit. */
function stockErrorMessage(error: Error): string {
  const m = error.message;
  if (m.includes('ThresholdMax must be greater')) return 'Le seuil max doit être supérieur au seuil min « Recommande à ».';
  if (m.includes('already exists')) return 'Un article portant ce nom existe déjà dans votre stock.';
  if (m.includes('only its thresholds can be changed'))
    return 'Cet article est utilisé (recette, mouvement, réapprovisionnement ou commande) : seuls ses seuils sont modifiables.';
  if (m.includes('cannot be deleted'))
    return 'Cet article est utilisé (recette, mouvement, réapprovisionnement ou commande) : il ne peut pas être supprimé.';
  if (m.includes('menu-service unreachable'))
    return "Impossible de vérifier l'utilisation de l'article pour le moment. Réessayez dans un instant.";
  if (m.includes('cannot be negative')) return 'Les quantités et les seuils ne peuvent pas être négatifs.';
  return m;
}

/** Why an article is locked, in French, for the manager. */
function lockReasons(usage: StockUsage): string[] {
  const reasons: string[] = [];
  if (usage.dishes.length > 0) reasons.push(`utilisé dans les recettes de : ${usage.dishes.join(', ')}`);
  if (usage.hasMovements) reasons.push('des mouvements de stock sont enregistrés');
  if (usage.hasReplenishments) reasons.push('des demandes de réapprovisionnement existent');
  if (usage.hasOrders) reasons.push('des commandes l\'ont consommé');
  return reasons;
}

/** Edit / delete an article. While something refers to it (recipe, movement,
 *  replenishment, order) only the thresholds can change and it cannot be deleted. */
function EditStockForm({ item, onClose }: { item: StockItem; onClose: () => void }) {
  const { data: usage, isLoading, error: usageError } = useStockUsage(item.id, true);
  const update = useUpdateStock();
  const remove = useDeleteStock();
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState({
    name: item.name,
    unit: item.unit,
    quantityOnHand: String(item.quantityOnHand),
    thresholdMin: String(item.thresholdMin),
    thresholdMax: String(item.thresholdMax),
  });

  const locked = usage?.isLocked ?? true; // fail closed until we know
  const reasons = usage ? lockReasons(usage) : [];
  const [formError, setFormError] = useState<string | null>(null);
  const apiError = (update.error ?? remove.error) as Error | null;
  const error = formError ?? (apiError ? stockErrorMessage(apiError) : null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = validateStockForm(form);
    setFormError(invalid);
    if (invalid) return;
    update.mutate(
      {
        id: item.id,
        payload: {
          name: form.name,
          unit: form.unit,
          quantityOnHand: Number(form.quantityOnHand),
          thresholdMin: Number(form.thresholdMin),
          thresholdMax: Number(form.thresholdMax),
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-brand/10 bg-white p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-brand">Modifier l'article</h3>
      {isLoading ? (
        <p className="text-sm text-neutral-400">Vérification de l'utilisation de l'article…</p>
      ) : usageError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          Impossible de vérifier si l'article est utilisé : {(usageError as Error).message}. Seuls les seuils sont
          modifiables.
        </p>
      ) : (
        locked && (
          <p className="rounded-xl bg-brand-pale px-4 py-3 text-sm text-brand">
            Cet article est lié ({reasons.join(' · ')}). Seuls les seuils peuvent être modifiés ; il ne peut pas être
            supprimé. Pour changer la quantité, utilisez un mouvement de stock.
          </p>
        )
      )}
      <div className="grid gap-3 sm:grid-cols-5">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Nom</span>
          <Input required disabled={locked} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Unité</span>
          <Input required disabled={locked} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Quantité</span>
          <Input
            type="number"
            min="0"
            step="any"
            required
            disabled={locked}
            value={form.quantityOnHand}
            onChange={(e) => setForm({ ...form, quantityOnHand: e.target.value })}
          />
        </label>
        <div className="grid grid-cols-2 gap-3 sm:col-span-5 sm:max-w-md">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Recommande à (seuil min)</span>
            <Input type="number" min="0" step="any" required value={form.thresholdMin} onChange={(e) => setForm({ ...form, thresholdMin: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Seuil max</span>
            <Input type="number" min="0" step="any" required value={form.thresholdMax} onChange={(e) => setForm({ ...form, thresholdMax: e.target.value })} />
          </label>
        </div>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" className="px-4 py-2" disabled={update.isPending || isLoading}>
          {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <Button type="button" variant="ghost" className="px-4 py-2" onClick={onClose}>
          Annuler
        </Button>
        <div className="ml-auto flex items-center gap-2">
          {confirming ? (
            <>
              <span className="text-sm text-neutral-600">Supprimer « {item.name} » ?</span>
              <Button
                type="button"
                variant="danger"
                className="px-3 py-1.5 text-xs"
                disabled={remove.isPending}
                onClick={() => remove.mutate(item.id, { onError: () => setConfirming(false) })}
              >
                {remove.isPending ? 'Suppression…' : 'Oui, supprimer'}
              </Button>
              <Button type="button" variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => setConfirming(false)}>
                Non
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              disabled={locked}
              title={locked ? 'Cet article est lié : suppression impossible' : undefined}
              onClick={() => setConfirming(true)}
            >
              <Trash2 size={14} /> Supprimer l'article
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
