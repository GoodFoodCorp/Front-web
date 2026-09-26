import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Settings,
  Star,
  Store,
  Trash2,
  Truck,
  User as UserIcon,
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { Switch } from '../components/Switch';
import {
  useAddAddress,
  useDeleteAddress,
  useMyAddresses,
  useMyProfile,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useUpdateProfile,
  useUploadAvatar,
} from '../features/profile/hooks/useProfile';
import type { UserProfile } from '../features/profile/types/profile.types';
import { useAuthStore } from '../store/authStore';
import { useChangePassword, useDeleteAccount, useLogout } from '../features/auth/hooks/useAuth';
import { useFavorites, useRemoveFavorite } from '../features/favorites/hooks/useFavorites';
import { useMenuItemsByIds } from '../features/catalog/hooks/useMenu';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { useAddPaymentMethod, usePaymentHistory, usePaymentMethods, useRemovePaymentMethod } from '../features/payments/hooks/usePayments';
import { formatDateTime, formatPrice } from '../utils/format';
import { dishPhoto } from '../utils/images';

const ROLE_LABELS: Record<string, { label: string; tone: 'yellow' | 'green' }> = {
  admin: { label: 'Siège', tone: 'green' },
  manager: { label: 'Gérant(e)', tone: 'yellow' },
  user: { label: 'Client', tone: 'green' },
  livreur: { label: 'Livreur', tone: 'green' },
};

type Tab = 'profile' | 'addresses' | 'payments' | 'favorites' | 'settings';

const STATIC_ITEMS: { key: Tab | string; label: string; icon: typeof UserIcon; comingSoon?: boolean }[] = [
  { key: 'profile', label: 'Mon Profil', icon: UserIcon },
  { key: 'orders', label: 'Mes Commandes', icon: Package },
  { key: 'addresses', label: 'Mes Adresses', icon: MapPin },
  { key: 'payments', label: 'Paiements', icon: CreditCard },
  { key: 'favorites', label: 'Favoris', icon: Heart },
  { key: 'delivery', label: 'Livraison', icon: Truck, comingSoon: true },
  { key: 'settings', label: 'Paramètres', icon: Settings },
];

const TAB_KEYS: Tab[] = ['profile', 'addresses', 'payments', 'favorites', 'settings'];

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
            <AvatarUploader profile={profile} fullName={fullName || ''} />
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
              if (TAB_KEYS.includes(key as Tab)) {
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
        {tab === 'profile' && <PersonalInfoPanel />}
        {tab === 'addresses' && <AddressesPanel />}
        {tab === 'payments' && <PaymentsPanel />}
        {tab === 'favorites' && <FavoritesPanel />}
        {tab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  );
}

function AvatarUploader({ profile, fullName }: { profile: UserProfile | undefined; fullName: string }) {
  const upload = useUploadAvatar();
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
    e.target.value = '';
  };

  return (
    <div className="relative h-24 w-24">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="Photo de profil" className="h-24 w-24 rounded-full object-cover" />
      ) : (
        <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-pale text-3xl font-display font-bold text-brand">
          {(fullName || '?').slice(0, 1).toUpperCase()}
        </div>
      )}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
        aria-label="Changer la photo de profil"
        className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-brand text-white shadow-[var(--shadow-lift)] transition hover:bg-brand-dark disabled:opacity-60"
      >
        <Camera size={14} />
      </button>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onPick} />
      {upload.isError && <p className="mt-2 text-xs text-red-600">{(upload.error as Error).message}</p>}
    </div>
  );
}

function PersonalInfoPanel() {
  const { data: profile } = useMyProfile();
  const email = useAuthStore((s) => s.email);
  const update = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', age: null as number | null });

  useEffect(() => {
    if (profile) {
      setForm({ first_name: profile.first_name, last_name: profile.last_name, phone: profile.phone, age: profile.age });
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
        <Field label="Téléphone">
          {editing ? (
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          ) : (
            <ReadOnlyValue value={form.phone} />
          )}
        </Field>
        <Field label="Âge">
          {editing ? (
            <Input
              type="number"
              min="0"
              max="120"
              value={form.age ?? ''}
              onChange={(e) => setForm({ ...form, age: e.target.value ? Number(e.target.value) : null })}
            />
          ) : (
            <ReadOnlyValue value={form.age != null ? String(form.age) : ''} />
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

const CARD_BRAND_ICON: Record<string, string> = {
  Visa: '💳',
  Mastercard: '💳',
  'American Express': '💳',
  Carte: '💳',
};

function PaymentsPanel() {
  const { data: history, isLoading: historyLoading } = usePaymentHistory();
  const { data: methods, isLoading: methodsLoading } = usePaymentMethods();
  const addMethod = useAddPaymentMethod();
  const removeMethod = useRemovePaymentMethod();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cardholder_name: '', card_number: '', exp_month: '', exp_year: '', is_default: false });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addMethod.mutate(
      {
        cardholder_name: form.cardholder_name,
        card_number: form.card_number,
        exp_month: Number(form.exp_month),
        exp_year: Number(form.exp_year),
        is_default: form.is_default,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ cardholder_name: '', card_number: '', exp_month: '', exp_year: '', is_default: false });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-brand/10 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-brand">Moyens de paiement</h2>
            <p className="text-sm text-neutral-400">
              Mode démonstration — aucune carte réelle n'est traitée ni transmise à un processeur.
            </p>
          </div>
          <Button variant="ghost" onClick={() => setShowForm((v) => !v)} className="px-3 py-1.5">
            <Plus size={16} /> Ajouter une carte
          </Button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="grid gap-3 rounded-xl bg-neutral-50 p-4 sm:grid-cols-6">
            <Input
              className="sm:col-span-6"
              placeholder="Nom du titulaire"
              required
              value={form.cardholder_name}
              onChange={(e) => setForm({ ...form, cardholder_name: e.target.value })}
            />
            <Input
              className="sm:col-span-3"
              placeholder="Numéro de carte (ex. 4242 4242 4242 4242)"
              required
              value={form.card_number}
              onChange={(e) => setForm({ ...form, card_number: e.target.value })}
            />
            <Input
              className="sm:col-span-1"
              type="number"
              placeholder="MM"
              min="1"
              max="12"
              required
              value={form.exp_month}
              onChange={(e) => setForm({ ...form, exp_month: e.target.value })}
            />
            <Input
              className="sm:col-span-2"
              type="number"
              placeholder="AAAA"
              min="2024"
              required
              value={form.exp_year}
              onChange={(e) => setForm({ ...form, exp_year: e.target.value })}
            />
            <label className="sm:col-span-6 flex items-center gap-2 text-sm font-semibold text-neutral-600">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
              />
              Définir comme moyen de paiement par défaut
            </label>
            {addMethod.isError && (
              <p className="sm:col-span-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(addMethod.error as Error).message}
              </p>
            )}
            <div className="sm:col-span-6 flex gap-2">
              <Button type="submit" disabled={addMethod.isPending}>
                {addMethod.isPending ? 'Ajout…' : 'Ajouter la carte'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </form>
        )}

        {methodsLoading ? (
          <Spinner />
        ) : !methods || methods.length === 0 ? (
          <EmptyState icon="💳" title="Aucun moyen de paiement" hint="Ajoutez une carte pour payer plus vite." />
        ) : (
          <div className="space-y-3">
            {methods.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-brand/10 p-4">
                <span className="text-xl">{CARD_BRAND_ICON[m.brand] ?? '💳'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-brand">
                      {m.brand} •••• {m.last4}
                    </span>
                    {m.isDefault && (
                      <Badge tone="yellow">
                        <Star size={11} className="mr-1" /> Par défaut
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-neutral-500">
                    {m.cardholderName} — expire {String(m.expMonth).padStart(2, '0')}/{m.expYear}
                  </p>
                </div>
                <button
                  onClick={() => removeMethod.mutate(m.id)}
                  disabled={removeMethod.isPending}
                  className="grid h-9 w-9 place-items-center rounded-lg text-neutral-300 hover:bg-red-50 hover:text-red-600"
                  aria-label="Supprimer la carte"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-brand/10 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand">Historique des paiements</h2>
        <p className="mt-1 text-sm text-neutral-400">Les paiements liés à vos commandes</p>

        <div className="mt-4">
          {historyLoading ? (
            <Spinner />
          ) : !history || history.length === 0 ? (
            <EmptyState icon="🧾" title="Aucun paiement" hint="Vos paiements apparaîtront ici après une commande." />
          ) : (
            <div className="space-y-3">
              {history.map((p) => (
                <Link
                  key={p.id}
                  to={`/orders/${p.orderId}`}
                  className="flex items-center gap-4 rounded-xl border border-brand/10 p-4 transition hover:border-brand/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-brand">
                        Commande #{p.orderId.slice(0, 8)}
                      </span>
                      <Badge tone={p.status === 'SUCCEEDED' ? 'green' : p.status === 'FAILED' ? 'red' : 'gray'}>
                        {p.status === 'SUCCEEDED' ? 'Payé' : p.status === 'FAILED' ? 'Échoué' : 'En attente'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {p.paidAt ? formatDateTime(p.paidAt) : 'Non finalisé'}
                    </p>
                  </div>
                  <span className="font-display text-lg font-extrabold text-brand">
                    {formatPrice(p.amountCents)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FavoritesPanel() {
  const { data: favorites, isLoading } = useFavorites();
  const { data: restaurants } = useRestaurants();
  const remove = useRemoveFavorite();

  const dishIds = (favorites ?? []).filter((f) => f.kind === 'dish').map((f) => f.targetId);
  const { data: dishes } = useMenuItemsByIds(dishIds);

  const favoriteRestaurants = (restaurants ?? []).filter((r) =>
    favorites?.some((f) => f.kind === 'restaurant' && f.targetId === r.id),
  );

  if (isLoading) return <Spinner label="Chargement de vos favoris…" />;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand/10 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand">Restaurants favoris</h2>
        <div className="mt-4">
          {favoriteRestaurants.length === 0 ? (
            <EmptyState icon="🏪" title="Aucun restaurant favori" hint="Ajoutez-en un depuis sa page." />
          ) : (
            <div className="space-y-3">
              {favoriteRestaurants.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-brand/10 p-4">
                  <Store size={18} className="shrink-0 text-brand" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/restaurants/${r.id}`} className="font-display font-bold text-brand hover:underline">
                      {r.name}
                    </Link>
                    <p className="truncate text-sm text-neutral-500">{r.city}</p>
                  </div>
                  <button
                    onClick={() => remove.mutate({ kind: 'restaurant', targetId: r.id })}
                    disabled={remove.isPending}
                    className="grid h-9 w-9 place-items-center rounded-lg text-neutral-300 hover:bg-red-50 hover:text-red-600"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-brand/10 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand">Plats favoris</h2>
        <div className="mt-4">
          {!dishes || dishes.length === 0 ? (
            <EmptyState icon="🍽️" title="Aucun plat favori" hint="Ajoutez-en un depuis un menu." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {dishes.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-brand/10 p-3">
                  <div
                    className="h-14 w-14 shrink-0 rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${dishPhoto(item.name, item.category)})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-brand">{item.name}</p>
                    <p className="text-sm text-neutral-500">{formatPrice(item.priceCents)}</p>
                  </div>
                  <button
                    onClick={() => remove.mutate({ kind: 'dish', targetId: item.id })}
                    disabled={remove.isPending}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-neutral-300 hover:bg-red-50 hover:text-red-600"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel() {
  const navigate = useNavigate();
  const { data: prefs, isLoading: prefsLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);
    if (passwordForm.next !== passwordForm.confirm) return;
    changePassword.mutate(
      { currentPassword: passwordForm.current, newPassword: passwordForm.next },
      {
        onSuccess: () => {
          setPasswordSuccess(true);
          navigate('/login');
        },
      },
    );
  };

  const submitDelete = (e: React.FormEvent) => {
    e.preventDefault();
    deleteAccount.mutate(deletePassword, { onSuccess: () => navigate('/login') });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-brand/10 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand">Notifications</h2>
        <p className="text-sm text-neutral-400">Choisissez comment nous pouvons vous contacter</p>

        {prefsLoading ? (
          <Spinner />
        ) : (
          <div className="mt-4 divide-y divide-brand/10">
            <ToggleRow
              label="Emails sur mes commandes"
              hint="Confirmation, statut, livraison"
              checked={prefs?.email_orders ?? true}
              disabled={updatePrefs.isPending}
              onChange={(checked) =>
                prefs && updatePrefs.mutate({ ...prefs, email_orders: checked })
              }
            />
            <ToggleRow
              label="Emails promotionnels"
              hint="Offres et nouveautés Good Food"
              checked={prefs?.email_promos ?? true}
              disabled={updatePrefs.isPending}
              onChange={(checked) =>
                prefs && updatePrefs.mutate({ ...prefs, email_promos: checked })
              }
            />
            <ToggleRow
              label="SMS sur mes commandes"
              hint="Alertes de livraison par SMS"
              checked={prefs?.sms_orders ?? false}
              disabled={updatePrefs.isPending}
              onChange={(checked) =>
                prefs && updatePrefs.mutate({ ...prefs, sms_orders: checked })
              }
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-brand/10 bg-white p-6">
        <h2 className="font-display text-lg font-bold text-brand">Mot de passe</h2>
        <p className="text-sm text-neutral-400">Vous serez déconnecté(e) après le changement</p>

        <form onSubmit={submitPassword} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Mot de passe actuel" className="sm:col-span-2">
            <Input
              type="password"
              required
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            />
          </Field>
          <Field label="Nouveau mot de passe">
            <Input
              type="password"
              required
              minLength={8}
              value={passwordForm.next}
              onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
            />
          </Field>
          <Field label="Confirmer">
            <Input
              type="password"
              required
              minLength={8}
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            />
          </Field>

          {passwordForm.confirm && passwordForm.next !== passwordForm.confirm && (
            <p className="sm:col-span-2 text-sm text-red-600">Les mots de passe ne correspondent pas.</p>
          )}
          {changePassword.isError && (
            <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {(changePassword.error as Error).message}
            </p>
          )}
          {passwordSuccess && (
            <p className="sm:col-span-2 text-sm font-semibold text-brand">Mot de passe modifié, reconnectez-vous ✓</p>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Modification…' : 'Changer le mot de passe'}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={18} />
          <h2 className="font-display text-lg font-bold">Zone dangereuse</h2>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          La suppression de votre compte est définitive et irréversible.
        </p>

        {!deleteOpen ? (
          <Button variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>
            Supprimer mon compte
          </Button>
        ) : (
          <form onSubmit={submitDelete} className="mt-4 space-y-3 rounded-xl bg-red-50 p-4">
            <Field label="Confirmez avec votre mot de passe">
              <Input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </Field>
            {deleteAccount.isError && (
              <p className="rounded-lg bg-white px-3 py-2 text-sm text-red-600">
                {(deleteAccount.error as Error).message}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" variant="danger" disabled={deleteAccount.isPending}>
                {deleteAccount.isPending ? 'Suppression…' : 'Confirmer la suppression'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-neutral-700">{label}</p>
        <p className="text-xs text-neutral-400">{hint}</p>
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} label={label} />
    </div>
  );
}
