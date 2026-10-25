import { useState } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { AiSettingsSection } from '../features/chat/components/AiSettingsSection';
import { useCategories, useCreateCategory, useDeleteCategory } from '../features/catalog/hooks/useMenu';

export function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand">Paramètres</h1>
        <p className="text-neutral-500">Réglages communs à tout le réseau de franchises</p>
      </div>

      <CategoriesSection />
      <AiSettingsSection />
    </div>
  );
}

function CategoriesSection() {
  const { data: categories, isLoading } = useCategories();
  const create = useCreateCategory();
  const remove = useDeleteCategory();
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);

  const close = () => {
    setAdding(false);
    setName('');
    create.reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate(name.trim(), { onSuccess: close });
  };

  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-5">
      <div className="flex items-center gap-2">
        <Tag size={18} className="text-brand" />
        <h2 className="font-display text-lg font-bold text-brand">Catégories de plats</h2>
      </div>
      <p className="mt-1 text-sm text-neutral-400">
        Utilisées par tous les franchisés lorsqu'ils créent un plat (Burgers, Pizzas, Boissons…).
      </p>

      <Button className="mt-4" onClick={() => setAdding(true)}>
        <Plus size={16} /> Nouvelle catégorie
      </Button>

      {adding && (
        <Modal title="Nouvelle catégorie" onClose={close} maxWidth="max-w-md">
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-neutral-600">Nom</span>
              <Input
                autoFocus
                placeholder="ex. Tacos"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            {create.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(create.error as Error).message}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={create.isPending || !name.trim()}>
                {create.isPending ? 'Ajout…' : 'Ajouter'}
              </Button>
              <Button type="button" variant="ghost" onClick={close}>
                Annuler
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <div className="mt-5">
        {isLoading ? (
          <Spinner />
        ) : !categories || categories.length === 0 ? (
          <EmptyState icon="🏷️" title="Aucune catégorie" hint="Ajoutez la première catégorie du réseau." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-2 rounded-full border border-brand/15 bg-brand-pale py-1.5 pl-3 pr-1.5 text-sm font-semibold text-brand"
              >
                {c.name}
                <button
                  onClick={() => remove.mutate(c.id)}
                  disabled={remove.isPending}
                  className="grid h-6 w-6 place-items-center rounded-full text-brand/60 transition hover:bg-red-100 hover:text-red-600"
                  aria-label={`Supprimer ${c.name}`}
                  title="Supprimer cette catégorie"
                >
                  <Trash2 size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
