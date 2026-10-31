import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  CheckCircle2,
  Clock,
  Euro,
  LocateFixed,
  LocateOff,
  LogOut,
  MapPin,
  Navigation,
  PackageCheck,
  Star,
  Truck,
  UserRound,
  Wallet,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Spinner } from '../components/Spinner';
import { Switch } from '../components/Switch';
import { useLogout } from '../features/auth/hooks/useAuth';
import { DeliveryStatusBadge } from '../features/delivery/components/DeliveryStatusBadge';
import {
  useAcceptDelivery,
  useAvailableDeliveries,
  useCourierOverview,
  useCourierProfile,
  useDropoffDelivery,
  useMyDeliveries,
  usePickupDelivery,
  useReleaseDelivery,
  useRequestPayout,
  useSaveCourierProfile,
  useSetAvailability,
} from '../features/delivery/hooks/useDelivery';
import type { AvailableDelivery, CourierProfileForm, Delivery, VehicleType } from '../features/delivery/types/delivery.types';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { LiveMap } from '../features/tracking/LiveMap';
import { formatEta, navigationLinks, type LivePosition } from '../features/tracking/useLiveDelivery';
import { useShareLocation, type SharingState } from '../features/tracking/useShareLocation';
import { formatDateTime, formatPrice } from '../utils/format';
import logo from '../assets/logo.svg';

type Tab = 'runs' | 'earnings' | 'profile';

const TABS: { id: Tab; label: string; icon: typeof Truck }[] = [
  { id: 'runs', label: 'Courses', icon: Truck },
  { id: 'earnings', label: 'Gains', icon: Wallet },
  { id: 'profile', label: 'Profil', icon: UserRound },
];

const euros = (amount: number) => formatPrice(Math.round(amount * 100));

/**
 * Web courier console (also usable on a phone): go online, take a delivery,
 * ride with the map and turn-by-turn links, hand it over with the customer's
 * code; follow earnings and payouts; keep the profile up to date.
 */
export function CourierPage() {
  const navigate = useNavigate();
  const logout = useLogout();
  const [tab, setTab] = useState<Tab>('runs');
  const { data: profile } = useCourierProfile();
  const availability = useSetAvailability();

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 sm:pb-0">
      <header className="sticky top-0 z-30 bg-brand text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Good Food" className="h-9 w-9" />
            <div>
              <p className="font-display font-extrabold leading-tight">Good Food</p>
              <p className="text-xs text-white/60">Espace livreur</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile && (
              <label className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <span className={profile.isAvailable ? 'text-accent' : 'text-white/70'}>
                  {profile.isAvailable ? 'En ligne' : 'Hors ligne'}
                </span>
                <Switch
                  checked={profile.isAvailable}
                  onChange={(v: boolean) => availability.mutate(v)}
                  label="Disponible pour des courses"
                />
              </label>
            )}
            <NotificationBell />
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              aria-label="Déconnexion"
              className="grid h-10 w-10 place-items-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-3xl gap-1 px-4 sm:flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === t.id ? 'bg-neutral-50 text-brand' : 'text-white/75 hover:text-white'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
        {tab === 'runs' && <Runs online={profile?.isAvailable ?? true} />}
        {tab === 'earnings' && <Earnings />}
        {tab === 'profile' && <Profile />}
      </main>

      {/* Phone: tabs at the thumb. */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-brand/10 bg-white sm:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${tab === t.id ? 'text-brand' : 'text-neutral-400'}`}
          >
            <t.icon size={20} /> {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── Courses ───────────────────────────────────────────────────

function Runs({ online }: { online: boolean }) {
  const { data: mine, isLoading: loadingMine } = useMyDeliveries();
  const { data: available, isLoading: loadingAvailable } = useAvailableDeliveries();
  const active = (mine ?? []).filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED');
  const sharing = useShareLocation(active.map((d) => d._id));
  const offers = [...(available ?? [])].sort((a, b) => b.courierFeeCents + b.tipCents - (a.courierFeeCents + a.tipCents));

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-brand">Mes courses en cours</h2>
          {active.length > 0 && <SharingBadge state={sharing.state} />}
        </div>
        {loadingMine ? (
          <Spinner label="Chargement…" />
        ) : active.length === 0 ? (
          <EmptyState icon="🛵" title="Aucune course en cours" hint="Acceptez une course ci-dessous." />
        ) : (
          active.map((delivery) => (
            <ActiveDelivery
              key={delivery._id}
              delivery={delivery}
              courier={sharing.position}
              live={sharing.live[delivery._id]}
            />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-brand">Courses disponibles</h2>
        {!online ? (
          <EmptyState icon="🌙" title="Vous êtes hors ligne" hint="Passez en ligne (en haut) pour recevoir des courses." />
        ) : loadingAvailable ? (
          <Spinner label="Recherche de courses…" />
        ) : offers.length === 0 ? (
          <EmptyState
            icon="📭"
            title="Aucune course pour le moment"
            hint="Vous serez prévenu dès qu'une commande est prête à partir."
          />
        ) : (
          offers.map((delivery) => <Offer key={delivery.id} delivery={delivery} />)
        )}
      </section>
    </>
  );
}

function SharingBadge({ state }: { state: SharingState }) {
  if (state === 'on') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-pale px-3 py-1 text-xs font-semibold text-brand">
        <LocateFixed size={13} /> Position partagée
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <LocateOff size={13} />
      {state === 'denied'
        ? 'Autorisez la localisation pour le suivi client'
        : state === 'unsupported'
          ? 'Localisation indisponible sur cet appareil'
          : 'Localisation en cours…'}
    </span>
  );
}

function Offer({ delivery }: { delivery: AvailableDelivery }) {
  const accept = useAcceptDelivery();
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display font-bold text-brand">{delivery.pickup.address}</p>
          <p className="text-sm text-neutral-500">
            {delivery.distanceKm.toString().replace('.', ',')} km jusqu'au client · commande #{delivery.orderId.slice(0, 8)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-extrabold text-brand">{formatPrice(delivery.courierFeeCents + delivery.tipCents)}</p>
          {delivery.tipCents > 0 && <p className="text-xs text-neutral-400">dont {formatPrice(delivery.tipCents)} de pourboire</p>}
        </div>
      </div>
      <Button disabled={accept.isPending} onClick={() => accept.mutate(delivery.id)} className="w-full sm:w-auto">
        <CheckCircle2 size={16} /> Accepter la course
      </Button>
      {accept.isError && <p className="text-sm text-red-600">{(accept.error as Error).message}</p>}
    </Card>
  );
}

function ActiveDelivery({
  delivery,
  courier,
  live,
}: {
  delivery: Delivery;
  courier: { lat: number; lng: number } | null;
  live?: LivePosition;
}) {
  const pickup = usePickupDelivery();
  const dropoff = useDropoffDelivery();
  const release = useReleaseDelivery();
  const [code, setCode] = useState('');
  const error = (pickup.error ?? dropoff.error ?? release.error) as Error | null;
  const toRestaurant = delivery.status === 'ASSIGNED';
  const target = toRestaurant ? delivery.pickup : delivery.dropoff;
  const links = navigationLinks(target);
  const eta = formatEta(live?.etaAt ?? delivery.estimatedDeliveryTime);

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display font-bold text-brand">Commande #{delivery.orderId.slice(0, 8)}</p>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      <div className="space-y-2 text-sm">
        <Stop letter="R" label="Restaurant" address={delivery.pickup.address} current={toRestaurant} />
        <Stop letter="C" label="Client" address={delivery.dropoff.address} current={!toRestaurant} />
      </div>

      <LiveMap
        restaurant={delivery.pickup}
        customer={delivery.dropoff}
        courier={courier}
        towards={toRestaurant ? 'restaurant' : 'customer'}
        className="h-56"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <a href={links.google} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-xl border border-brand/20 px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-pale">
            <Navigation size={15} /> Google Maps
          </a>
          <a href={links.waze} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-xl border border-brand/20 px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-pale">
            <Navigation size={15} /> Waze
          </a>
          <a href={links.apple} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-xl border border-brand/20 px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-pale">
            <Navigation size={15} /> Plans
          </a>
        </div>
        {eta && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600">
            <Clock size={14} /> Arrivée client {eta}
          </span>
        )}
      </div>

      {toRestaurant && (
        <div className="flex flex-wrap gap-2">
          <Button disabled={pickup.isPending} onClick={() => pickup.mutate(delivery._id)}>
            <PackageCheck size={16} /> J'ai récupéré la commande
          </Button>
          <Button variant="ghost" disabled={release.isPending} onClick={() => release.mutate(delivery._id)}>
            Libérer la course
          </Button>
        </div>
      )}
      {!toRestaurant && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            placeholder="Code à 4 chiffres du client"
            aria-label="Code donné par le client"
            className="w-56"
          />
          <Button disabled={dropoff.isPending || code.length !== 4} onClick={() => dropoff.mutate({ id: delivery._id, code })}>
            <Truck size={16} /> Commande livrée
          </Button>
        </div>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error.message}</p>}
    </Card>
  );
}

function Stop({ letter, label, address, current }: { letter: string; label: string; address: string; current: boolean }) {
  return (
    <p className={`flex items-start gap-2 ${current ? 'text-neutral-800' : 'text-neutral-400'}`}>
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
          current ? 'bg-accent text-brand-dark' : 'bg-neutral-100 text-neutral-400'
        }`}
      >
        {letter}
      </span>
      <span>
        <span className="font-semibold">{label} · </span>
        {address}
      </span>
    </p>
  );
}

// ── Gains ─────────────────────────────────────────────────────

function Earnings() {
  const { data, isLoading, isError } = useCourierOverview();
  const payout = useRequestPayout();
  if (isLoading) return <Spinner label="Calcul de vos gains…" />;
  if (isError || !data) return <EmptyState icon="💶" title="Gains indisponibles" hint="Réessayez dans un instant." />;
  const canWithdraw = data.availableBalance >= data.minWithdrawal && !data.withdrawals.some((w) => w.status === 'PENDING');

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Tile icon={Euro} label="Disponible" value={euros(data.availableBalance)} />
        <Tile icon={Bike} label="Courses livrées" value={String(data.completedTrips)} />
        <Tile
          icon={Star}
          label="Note moyenne"
          value={data.rating.average ? `${data.rating.average.toFixed(1).replace('.', ',')} / 5` : '—'}
          hint={data.rating.count ? `${data.rating.count} avis` : undefined}
        />
      </div>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display font-bold text-brand">Virement</p>
            <p className="text-sm text-neutral-500">
              {data.ibanMasked ? `Vers ${data.ibanMasked}` : 'Ajoutez votre IBAN dans le profil.'} · minimum {euros(data.minWithdrawal)}
            </p>
          </div>
          <Button disabled={!canWithdraw || payout.isPending} onClick={() => payout.mutate()}>
            <Wallet size={16} /> Demander {euros(data.availableBalance)}
          </Button>
        </div>
        {data.pendingAmount > 0 && <p className="text-sm text-amber-700">Virement de {euros(data.pendingAmount)} en cours de traitement.</p>}
        {payout.isError && <p className="text-sm text-red-600">{(payout.error as Error).message}</p>}
        <p className="text-xs text-neutral-400">Total gagné : {euros(data.totalEarned)} · déjà versé : {euros(data.withdrawnTotal)}</p>
      </Card>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold text-brand">Dernières courses</h2>
        {data.trips.length === 0 ? (
          <EmptyState icon="🧾" title="Aucune course livrée" hint="Vos courses livrées apparaîtront ici." />
        ) : (
          <Card className="divide-y divide-brand/10 p-0">
            {data.trips.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-neutral-700">{t.dropoffAddress}</p>
                  <p className="truncate text-xs text-neutral-400">
                    {t.pickupAddress} · {t.deliveredAt ? formatDateTime(t.deliveredAt) : ''}
                  </p>
                </div>
                <span className="shrink-0 font-display font-bold text-brand">{euros(t.amount)}</span>
              </div>
            ))}
          </Card>
        )}
      </section>

      {data.withdrawals.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-brand">Virements</h2>
          <Card className="divide-y divide-brand/10 p-0">
            {data.withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-neutral-600">
                  {formatDateTime(w.requestedAt)} · {w.ibanMasked}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${w.status === 'PAID' ? 'bg-brand-pale text-brand' : 'bg-amber-50 text-amber-700'}`}>
                    {w.status === 'PAID' ? 'Versé' : 'En cours'}
                  </span>
                  <span className="font-display font-bold text-brand">{euros(w.amount)}</span>
                </span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </>
  );
}

function Tile({ icon: Icon, label, value, hint }: { icon: typeof Euro; label: string; value: string; hint?: string }) {
  return (
    <Card className="space-y-1">
      <p className="flex items-center gap-1.5 text-sm text-neutral-500">
        <Icon size={15} /> {label}
      </p>
      <p className="font-display text-2xl font-extrabold text-brand">{value}</p>
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </Card>
  );
}

// ── Profil ────────────────────────────────────────────────────

const VEHICLES: { value: VehicleType; label: string }[] = [
  { value: 'bike', label: 'Vélo' },
  { value: 'ebike', label: 'Vélo électrique' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'car', label: 'Voiture' },
];

function Profile() {
  const { data: profile, isLoading } = useCourierProfile();
  const save = useSaveCourierProfile();
  const [form, setForm] = useState<CourierProfileForm | null>(null);
  if (isLoading) return <Spinner label="Chargement du profil…" />;

  const current: CourierProfileForm = form ?? {
    vehicleType: profile?.vehicleType ?? 'bike',
    siret: profile?.siret ?? '',
    city: profile?.city ?? '',
    iban: '',
    drivingLicenseNumber: '',
    hasBagEquipped: profile?.hasBagEquipped ?? false,
  };
  const set = (patch: Partial<CourierProfileForm>) => setForm({ ...current, ...patch });
  const needsLicense = current.vehicleType === 'scooter' || current.vehicleType === 'car';

  return (
    <Card>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(current, { onSuccess: () => setForm(null) });
        }}
      >
        <div className="sm:col-span-2">
          <p className="font-display text-lg font-bold text-brand">{profile?.siret ? 'Mon profil livreur' : 'Compléter mon profil'}</p>
          <p className="text-sm text-neutral-500">Ces informations servent à vous attribuer des courses et à vous payer.</p>
        </div>
        <Field label="Véhicule">
          <Select value={current.vehicleType} onChange={(v) => set({ vehicleType: v as VehicleType })} options={VEHICLES} aria-label="Véhicule" />
        </Field>
        <Field label="Ville">
          <Input value={current.city} onChange={(e) => set({ city: e.target.value })} required placeholder="Paris" />
        </Field>
        <Field label="SIREN (9 chiffres)">
          <Input value={current.siret} onChange={(e) => set({ siret: e.target.value.replace(/\D/g, '').slice(0, 9) })} required inputMode="numeric" />
        </Field>
        <Field label="IBAN">
          <Input
            value={current.iban}
            onChange={(e) => set({ iban: e.target.value.toUpperCase() })}
            required
            placeholder={profile ? 'Ressaisissez votre IBAN pour enregistrer' : 'FR76 …'}
            autoComplete="off"
          />
        </Field>
        {needsLicense && (
          <Field label="N° de permis">
            <Input value={current.drivingLicenseNumber ?? ''} onChange={(e) => set({ drivingLicenseNumber: e.target.value })} required />
          </Field>
        )}
        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-600 sm:col-span-2">
          <input type="checkbox" checked={current.hasBagEquipped} onChange={(e) => set({ hasBagEquipped: e.target.checked })} />
          J'ai un sac isotherme (obligatoire)
        </label>
        {save.isError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 sm:col-span-2">{(save.error as Error).message}</p>}
        {save.isSuccess && !form && <p className="rounded-lg bg-brand-pale px-3 py-2 text-sm text-brand sm:col-span-2">Profil enregistré.</p>}
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            <MapPin size={16} /> {save.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-neutral-600">{label}</span>
      {children}
    </label>
  );
}
