import { useState } from 'react';
import { AlertTriangle, Check, Plus } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { LocationBadge } from '../components/LocationBadge';
import { Spinner } from '../components/Spinner';
import { useCreateReplenishment, useCreateStock, useRegisterMovement, useStocks } from '../features/stock/hooks/useStock';
import type { StockItem } from '../features/stock/types/stock.types';

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
          <td colSpan={6} className="px-5 py-3">
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
          </td>
        </tr>
      )}
    </>
  );
}

function CreateStockForm({ onDone }: { onDone: () => void }) {
  const create = useCreateStock();
  const [form, setForm] = useState({ name: '', unit: 'kg', quantityOnHand: '', thresholdMin: '', thresholdMax: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
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
      {create.isError && (
        <p className="sm:col-span-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {(create.error as Error).message}
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
