import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Settings,
  Star,
  Trash2,
  Truck,
  User as UserIcon,
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
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
import { useLogout } from '../features/auth/hooks/useAuth';

const ROLE_LABELS: Record<string, { label: string; tone: 'yellow' | 'green' }> = {
  admin: { label: 'Siège', tone: 'green' },
  manager: { label: 'Gérant(e)', tone: 'yellow' },
  user: { label: 'Client', tone: 'green' },
  livreur: { label: 'Livreur', tone: 'green' },
};

type Tab = 'profile' | 'addresses';

const STATIC_ITEMS: { key: Tab | string; label: string; icon: typeof UserIcon; comingSoon?: boolean }[] = [
  { key: 'profile', label: 'Mon Profil', icon: UserIcon },
  { key: 'orders', label: 'Mes Commandes', icon: Package },
  { key: 'addresses', label: 'Mes Adresses', icon: MapPin },
  { key: 'payments', label: 'Paiements', icon: CreditCard, comingSoon: true },
  { key: 'favorites', label: 'Favoris', icon: Heart, comingSoon: true },
  { key: 'delivery', label: 'Livraison', icon: Truck, comingSoon: true },
  { key: 'settings', label: 'Paramètres', icon: Settings, comingSoon: true },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const roles = useAuthStore((s) => s.roles);
  const logout = useLogout();
  const { data: profile, isLoading } = useMyProfile();
  const [tab, setTab] = useState<Tab>('profile');
  const [comingSoon, setComingSoon] = useState<string | null>(null);

  if (isLoading) return <Spinner label="Chargement de votre profil…" />;

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : email;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        ← Retour à l'accueil
      </Link>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="h-fit rounded-2xl border border-brand/10 bg-white p-6">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-pale text-3xl font-display font-bold text-brand">
              {(fullName || '?').slice(0, 1).toUpperCase()}
            </div>
            <p className="mt-3 font-display text-lg font-bold text-brand">{fullName || 'Mon compte'}</p>
            <p className="text-sm text-neutral-400">{email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {roles.length === 0 && <Badge tone="green">Client</Badge>}
              {roles.map((r) => (
                <Badge key={r} tone={ROLE_LABELS[r]?.tone ?? 'gray'}>
                  {ROLE_LABELS[r]?.label ?? r}
                </Badge>
              ))}
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {STATIC_ITEMS.map(({ key, label, icon: Icon, comingSoon: soon }) => {
              if (key === 'orders') {
                return (
                  <Link
                    key={key}
                    to="/orders"
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-brand-pale hover:text-brand"
                  >
                    <Icon size={17} /> {label}
                  </Link>
                );
              }
              if (key === 'profile' || key === 'addresses') {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key as Tab)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                      active ? 'bg-brand text-white' : 'text-neutral-600 hover:bg-brand-pale hover:text-brand'
                    }`}
                  >
                    <Icon size={17} /> {label}
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  onClick={() => setComingSoon(comingSoon === key ? null : key)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-neutral-600 transition hover:bg-brand-pale hover:text-brand"
                >
                  <Icon size={17} /> {label}
                  {soon && comingSoon === key && (
                    <span className="ml-auto text-xs font-normal text-neutral-400">Bientôt</span>
                  )}
                </button>
              );
            })}
            <div className="!mt-3 border-t border-brand/10 pt-3">
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} /> Déconnexion
              </button>
            </div>
          </nav>
        </div>

        {/* Content */}
        {tab === 'profile' ? <PersonalInfoPanel /> : <AddressesPanel />}
      </div>
    </div>
  );
}

function PersonalInfoPanel() {
  const { data: profile } = useMyProfile();
  const email = useAuthStore((s) => s.email);
  const update = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });

  useEffect(() => {
    if (profile) {
      setForm({ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone });
    }
  }, [profile]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(form, { onSuccess: () => setEditing(false) });
  };

  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-brand">Informations personnelles</h2>
          <p className="text-sm text-neutral-400">Gérez vos informations de profil</p>
        </div>
        <Button variant="ghost" onClick={() => setEditing((v) => !v)} className="px-3 py-1.5">
          <Pencil size={14} /> {editing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Prénom">
          {editing ? (
            <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          ) : (
            <ReadOnlyValue value={form.first_name} />
          )}
        </Field>
        <Field label="Nom">
          {editing ? (
            <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          ) : (
            <ReadOnlyValue value={form.last_name} />
          )}
        </Field>
        <Field label="Email" className="sm:col-span-2">
          <ReadOnlyValue value={email ?? ''} />
        </Field>
        <Field label="Téléphone" className="sm:col-span-2">
          {editing ? (
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          ) : (
            <ReadOnlyValue value={form.phone} />
          )}
        </Field>

        {update.isError && (
          <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {(update.error as Error).message}
          </p>
        )}

        {editing && (
          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
            {update.isSuccess && !update.isPending && (
              <span className="text-sm font-semibold text-brand">Profil mis à jour ✓</span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>
      {children}
    </div>
  );
}

function ReadOnlyValue({ value }: { value: string }) {
  return (
    <div className="w-full rounded-xl border border-transparent bg-neutral-50 px-4 py-2.5 text-sm text-neutral-600">
      {value || '—'}
    </div>
  );
}

function AddressesPanel() {
  const { data: addresses, isLoading } = useMyAddresses();
  const add = useAddAddress();
  const remove = useDeleteAddress();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', street: '', zip_code: '', city: '', is_default: false });

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
    <div className="space-y-4 rounded-2xl border border-brand/10 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-brand">Mes adresses de livraison</h2>
          <p className="text-sm text-neutral-400">Gérez vos adresses enregistrées</p>
        </div>
        <Button variant="ghost" onClick={() => setShowForm((v) => !v)} className="px-3 py-1.5">
          <Plus size={16} /> Ajouter
        </Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="grid gap-3 rounded-xl bg-neutral-50 p-4 sm:grid-cols-6">
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
      )}

      {isLoading ? (
        <Spinner />
      ) : !addresses || addresses.length === 0 ? (
        <EmptyState icon="📍" title="Aucune adresse" hint="Ajoutez une adresse de livraison." />
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-brand/10 p-4">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
