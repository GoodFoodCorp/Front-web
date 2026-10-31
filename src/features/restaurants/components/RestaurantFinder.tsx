import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bike, LocateFixed, MapPin, Search, ShoppingBag, X } from 'lucide-react';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import { Select } from '../../../components/Select';
import { RatingBadge } from '../../reviews';
import type { ReviewSummary } from '../../reviews/reviewsApi';
import { useLocationStore } from '../../../store/locationStore';
import { formatPrice } from '../../../utils/format';
import { citiesOf, findRestaurants, formatDistance, isOpen, type FoundRestaurant, type SortKey } from '../finder';
import type { Restaurant } from '../types/restaurant.types';
import { AddressAutocomplete } from './AddressAutocomplete';

const PAGE_SIZE = 9;

/**
 * Finds a restaurant among many: from an address or the browser's position
 * (closest first, which ones deliver there), by name, street, city or postal
 * code, open now only. `?q=` (the header search) prefills the text.
 */
export function RestaurantFinder({
  restaurants,
  marks,
}: {
  restaurants: Restaurant[];
  marks: Map<string, ReviewSummary> | undefined;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { place, setPlace } = useLocationStore();
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [text, setText] = useState(searchParams.get('q') ?? '');
  const [city, setCity] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [deliversOnly, setDeliversOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>(place ? 'distance' : 'rating');
  const [more, setMore] = useState({ key: '', limit: PAGE_SIZE });

  // The header search lands here: show its matches.
  const q = searchParams.get('q');
  useEffect(() => {
    if (q === null) return;
    setText(q);
    document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [q]);

  const choosePlace = (next: { label: string; lat: number; lng: number } | null) => {
    setPlace(next);
    setSort(next ? 'distance' : 'rating');
    if (!next) setDeliversOnly(false);
  };

  const locateMe = () => {
    setLocateError('');
    if (!('geolocation' in navigator)) {
      setLocateError('Votre navigateur ne permet pas de vous localiser : saisissez votre adresse.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        choosePlace({ label: 'Ma position actuelle', lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setLocateError('Position indisponible (autorisation refusée ?) : saisissez votre adresse.');
      },
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  };

  const cities = useMemo(() => citiesOf(restaurants), [restaurants]);
  const filters = { text, city, openOnly, deliversOnly, sort };
  const found = useMemo(
    () => findRestaurants(restaurants, { text, city, openOnly, deliversOnly, sort }, place, (id) => marks?.get(id)?.average),
    [restaurants, text, city, openOnly, deliversOnly, sort, place, marks],
  );
  // A new search starts again from the first page.
  const key = JSON.stringify([filters, place]);
  const limit = more.key === key ? more.limit : PAGE_SIZE;
  const filtered = text !== '' || city !== '' || openOnly || deliversOnly;
  const reset = () => {
    setText('');
    setCity('');
    setOpenOnly(false);
    setDeliversOnly(false);
  };

  const sortOptions = [
    ...(place ? [{ value: 'distance', label: 'Les plus proches' }] : []),
    { value: 'rating', label: 'Les mieux notés' },
    { value: 'name', label: 'Par nom (A → Z)' },
  ];

  return (
    <section id="restaurants" aria-labelledby="restaurants-title" className="scroll-mt-24">
      <h2 id="restaurants-title" className="font-display text-2xl font-bold text-brand sm:text-3xl">
        Nos restaurants
      </h2>
      <p className="mt-1 text-neutral-500">
        Indiquez votre adresse pour voir les restaurants qui vous livrent, du plus proche au plus loin.
      </p>

      <div className="mt-5 space-y-3 rounded-2xl border border-brand/10 bg-white p-4">
        {place ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-brand-pale px-4 py-2.5 text-sm text-brand">
            <MapPin size={16} aria-hidden className="shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              Autour de : <strong>{place.label}</strong>
            </span>
            <button
              type="button"
              onClick={() => choosePlace(null)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold transition hover:bg-white"
            >
              <X size={14} aria-hidden /> Changer d’adresse
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="finder-address" className="sr-only">
                Votre adresse
              </label>
              <AddressAutocomplete
                id="finder-address"
                value={address}
                onChange={setAddress}
                onSelect={(s) => {
                  setAddress('');
                  choosePlace({ label: s.label, lat: s.latitude, lng: s.longitude });
                }}
                placeholder="Votre adresse de livraison"
              />
            </div>
            <Button variant="ghost" onClick={locateMe} disabled={locating} className="shrink-0">
              <LocateFixed size={16} aria-hidden />
              {locating ? 'Localisation…' : 'Autour de moi'}
            </Button>
          </div>
        )}
        {locateError && (
          <p role="alert" className="text-sm text-red-600">
            {locateError}
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="flex items-center gap-2 rounded-xl border border-brand/15 bg-white px-4 py-2.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
            <Search size={16} aria-hidden className="shrink-0 text-neutral-400" />
            <input
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nom, rue, ville ou code postal"
              aria-label="Rechercher un restaurant"
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            />
          </div>
          <Select
            aria-label="Ville"
            value={city}
            onChange={setCity}
            className="sm:w-52"
            options={[
              { value: '', label: 'Toutes les villes', hint: `${restaurants.length} restaurants` },
              ...cities.map((c) => ({
                value: c.city,
                label: c.city,
                hint: `${c.count} restaurant${c.count > 1 ? 's' : ''}`,
              })),
            ]}
          />
          <Select
            aria-label="Trier"
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            className="sm:w-48"
            options={sortOptions}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip pressed={openOnly} onToggle={() => setOpenOnly((v) => !v)}>
            Ouverts maintenant
          </Chip>
          {place && (
            <Chip pressed={deliversOnly} onToggle={() => setDeliversOnly((v) => !v)}>
              Me livrent
            </Chip>
          )}
          {filtered && (
            <button type="button" onClick={reset} className="text-sm font-semibold text-brand underline-offset-2 hover:underline">
              Effacer les filtres
            </button>
          )}
          <p className="ml-auto text-sm text-neutral-500" aria-live="polite">
            {found.length} restaurant{found.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {found.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon="🔎"
            title="Aucun restaurant ne correspond"
            hint={deliversOnly ? 'Aucun restaurant ne livre encore cette adresse : la vente à emporter reste possible.' : 'Essayez une autre ville ou un autre nom.'}
          />
          {filtered && (
            <div className="mt-3 text-center">
              <Button variant="ghost" onClick={reset}>
                Voir tous les restaurants
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {found.slice(0, limit).map((f) => (
              <li key={f.restaurant.id} className="flex">
                <RestaurantCard found={f} summary={marks?.get(f.restaurant.id)} onOpen={() => navigate(`/restaurants/${f.restaurant.id}`)} />
              </li>
            ))}
          </ul>
          {found.length > limit && (
            <div className="mt-5 text-center">
              <Button variant="ghost" onClick={() => setMore({ key, limit: limit + PAGE_SIZE })}>
                Voir plus de restaurants ({found.length - limit} autres)
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Chip({ pressed, onToggle, children }: { pressed: boolean; onToggle: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
        pressed ? 'border-brand bg-brand text-white' : 'border-brand/20 bg-white text-brand hover:bg-brand-pale'
      }`}
    >
      {children}
    </button>
  );
}

function RestaurantCard({
  found: { restaurant, distanceKm, delivers },
  summary,
  onOpen,
}: {
  found: FoundRestaurant;
  summary: ReviewSummary | undefined;
  onOpen: () => void;
}) {
  const open = isOpen(restaurant);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-2 rounded-2xl border border-brand/10 bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-brand">{restaurant.name}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            open ? 'bg-brand-pale text-brand' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          {open ? 'Ouvert' : 'Fermé'}
        </span>
      </div>
      <p className="flex items-start gap-1.5 text-sm text-neutral-500">
        <MapPin size={14} aria-hidden className="mt-0.5 shrink-0" />
        <span>
          {restaurant.address}, {restaurant.city}
          {distanceKm !== null && <span className="font-semibold text-neutral-700"> · {formatDistance(distanceKm)}</span>}
        </span>
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
        <RatingBadge summary={summary} />
        {delivers === false ? (
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            <ShoppingBag size={14} aria-hidden /> À emporter (hors zone)
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-neutral-500">
            <Bike size={14} aria-hidden />
            {restaurant.deliveryFeeCents ? `Livraison ${formatPrice(restaurant.deliveryFeeCents)}` : 'Livraison offerte'}
          </span>
        )}
      </div>
    </button>
  );
}
