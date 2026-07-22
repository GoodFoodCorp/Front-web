import { useEffect, useState } from 'react';
import { MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import {
  useAddAddress,
  useDeleteAddress,
  useMyAddresses,
  useMyProfile,
  useUpdateProfile,
} from '../features/profile/hooks/useProfile';
import { useAuthStore } from '../store/authStore';

export function ProfilePage() {
  const email = useAuthStore((s) => s.email);
  const { data: profile, isLoading } = useMyProfile();
  const update = useUpdateProfile();
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });

  // Hydrate the form once the profile arrives.
  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
      });
    }
  }, [profile]);

  if (isLoading) return <Spinner label="Chargement de votre profil…" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand">Mon profil</h1>
        <p className="text-sm text-neutral-500">{email}</p>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate(form);
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Prénom</label>
            <Input
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder="Marie"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Nom</label>
            <Input
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder="Dupont"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Téléphone</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="06 01 02 03 04"
            />
          </div>
          {update.isError && (
            <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {(update.error as Error).message}
            </p>
          )}
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
            {update.isSuccess && !update.isPending && (
              <span className="text-sm font-semibold text-brand">Profil mis à jour ✓</span>
            )}
          </div>
        </form>
      </Card>

      <AddressesSection />
    </div>
  );
}

function AddressesSection() {
  const { data: addresses, isLoading } = useMyAddresses();
  const add = useAddAddress();
  const remove = useDeleteAddress();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: '',
    street: '',
    zip_code: '',
    city: '',
    is_default: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    add.mutate(form, {
      onSuccess: () => {
        setShowForm(false);
        setForm({ label: '', street: '', zip_code: '', city: '', is_default: false });
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-brand">Mes adresses de livraison</h2>
        <Button variant="ghost" onClick={() => setShowForm((v) => !v)} className="px-3 py-1.5">
          <Plus size={16} /> Ajouter
        </Button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-6">
            <Input
              className="sm:col-span-2"
              placeholder="Libellé (Domicile…)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <Input
              className="sm:col-span-4"
              placeholder="Rue"
              required
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
            <Input
              className="sm:col-span-2"
              placeholder="Code postal"
              value={form.zip_code}
              onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
            />
            <Input
              className="sm:col-span-4"
              placeholder="Ville"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <label className="sm:col-span-6 flex items-center gap-2 text-sm font-semibold text-neutral-600">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              />
              Adresse par défaut
            </label>
            {add.isError && (
              <p className="sm:col-span-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(add.error as Error).message}
              </p>
            )}
            <div className="sm:col-span-6 flex gap-2">
              <Button type="submit" disabled={add.isPending}>
                {add.isPending ? 'Ajout…' : "Ajouter l'adresse"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : !addresses || addresses.length === 0 ? (
        <EmptyState icon="📍" title="Aucune adresse" hint="Ajoutez une adresse de livraison." />
      ) : (
        addresses.map((a) => (
          <Card key={a.id} className="flex items-center gap-3">
            <MapPin size={18} className="shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-brand">{a.label}</span>
                {a.is_default && (
                  <Badge tone="yellow">
                    <Star size={11} className="mr-1" /> Par défaut
                  </Badge>
                )}
              </div>
              <p className="truncate text-sm text-neutral-500">{a.full_address}</p>
            </div>
            <button
              onClick={() => remove.mutate(a.id)}
              disabled={remove.isPending}
              className="grid h-9 w-9 place-items-center rounded-lg text-neutral-300 hover:bg-red-50 hover:text-red-600"
              aria-label="Supprimer l'adresse"
            >
              <Trash2 size={16} />
            </button>
          </Card>
        ))
      )}
    </div>
  );
}
