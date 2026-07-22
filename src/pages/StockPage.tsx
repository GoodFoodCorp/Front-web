import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { useCreateStock, useRegisterMovement, useStocks } from '../features/stock/hooks/useStock';
import type { StockItem } from '../features/stock/types/stock.types';

export function StockPage() {
  const { data: stocks, isLoading } = useStocks();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) return <Spinner label="Chargement des stocks…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Gestion des stocks</h1>
          <p className="text-neutral-500">Suivi des quantités et mouvements de votre restaurant</p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}>
          <Plus size={18} /> Nouvel article
        </Button>
      </div>

      {showCreate && <CreateStockForm onDone={() => setShowCreate(false)} />}

      {!stocks || stocks.length === 0 ? (
        <EmptyState icon="📦" title="Aucun article en stock" hint="Créez votre premier article." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-brand/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-brand-pale text-left font-display text-brand">
              <tr>
                <th className="px-5 py-3">Article</th>
                <th className="px-5 py-3">Quantité</th>
                <th className="px-5 py-3">Seuils</th>
                <th className="px-5 py-3">État</th>
                <th className="px-5 py-3 text-right">Mouvement</th>
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
  );
}

function StockRow({ item }: { item: StockItem }) {
  const movement = useRegisterMovement();
  const [qty, setQty] = useState('');

  const apply = (type: 'IN' | 'OUT') => {
    const quantity = Number(qty);
    if (!quantity || quantity <= 0) return;
    movement.mutate(
      { id: item.id, payload: { type, quantity, reason: type === 'IN' ? 'Réception' : 'Service' } },
      { onSuccess: () => setQty('') },
    );
  };

  return (
    <tr className="hover:bg-neutral-50">
      <td className="px-5 py-3 font-semibold text-brand">{item.name}</td>
      <td className="px-5 py-3">
        {item.quantityOnHand} {item.unit}
      </td>
      <td className="px-5 py-3 text-neutral-500">
        {item.thresholdMin} – {item.thresholdMax}
      </td>
      <td className="px-5 py-3">
        {item.isBelowMinimum ? (
          <Badge tone="red">
            <AlertTriangle size={12} className="mr-1" /> Sous seuil
          </Badge>
        ) : (
          <Badge tone="green">OK</Badge>
        )}
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Qté"
            className="w-20 rounded-lg border border-brand/15 px-2 py-1.5 text-sm outline-none focus:border-brand"
          />
          <Button variant="ghost" onClick={() => apply('IN')} className="px-3 py-1.5" disabled={movement.isPending}>
            + Entrée
          </Button>
          <Button variant="accent" onClick={() => apply('OUT')} className="px-3 py-1.5" disabled={movement.isPending}>
            − Sortie
          </Button>
        </div>
      </td>
    </tr>
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
    <Card>
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
            {create.isPending ? 'Création…' : 'Créer l’article'}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  );
}
