import { useState } from 'react';
import { Mail, Phone, Plus, Trash2, Truck } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliers,
} from '../features/suppliers/hooks/useSuppliers';

/** Franchisee back-office: the suppliers of their own restaurant. */
export function SuppliersPage() {
  const { data: suppliers, isLoading } = useSuppliers();
  const create = useCreateSupplier();
  const remove = useDeleteSupplier();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', contactName: '', email: '', phone: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form, {
      onSuccess: () => {
        setShowForm(false);
        setForm({ name: '', contactName: '', email: '', phone: '' });
      },
    });
  };

  if (isLoading) return <Spinner label="Chargement des fournisseurs…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Fournisseurs</h1>
          <p className="text-neutral-500">Les fournisseurs de votre restaurant</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus size={18} /> Nouveau fournisseur
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4">
            <Input
              placeholder="Nom (ex. Metro)"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Contact"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {create.isError && (
              <p className="sm:col-span-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(create.error as Error).message}
              </p>
            )}
            <div className="sm:col-span-4 flex gap-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Création…' : 'Ajouter'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!suppliers || suppliers.length === 0 ? (
        <EmptyState icon="🚚" title="Aucun fournisseur" hint="Ajoutez votre premier fournisseur." />
      ) : (
        <div className="space-y-3">
          {suppliers.map((s) => (
            <Card key={s.id} className="flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-pale text-brand">
                <Truck size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-brand">{s.name}</p>
                <p className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                  {s.contactName && <span>{s.contactName}</span>}
                  {s.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={13} /> {s.email}
                    </span>
                  )}
                  {s.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} /> {s.phone}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => remove.mutate(s.id)}
                disabled={remove.isPending}
                className="grid h-9 w-9 place-items-center rounded-lg text-neutral-300 hover:bg-red-50 hover:text-red-600"
                aria-label="Supprimer le fournisseur"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
