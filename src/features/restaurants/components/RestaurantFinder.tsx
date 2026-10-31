import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bike, LocateFixed, MapPin, Search, ShoppingBag, Store, X } from 'lucide-react';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import { RatingBadge } from '../../reviews';
import type { ReviewSummary } from '../../reviews/reviewsApi';
import { useLocationStore } from '../../../store/locationStore';
import { formatPrice } from '../../../utils/format';
import { restaurantsApi } from '../api/restaurantsApi';
import {
  formatDistance,
  isOpen,
  listRestaurants,
  matchRestaurants,
  relevantPlaces,
  type FoundRestaurant,
  type Place,
} from '../finder';
import type { AddressSuggestion, Restaurant } from '../types/restaurant.types';

const PAGE_SIZE = 9;
const MAX_RESTAURANT_OPTIONS = 4;
const MIN_PLACE_CHARS = 3;
const DEBOUNCE_MS = 250;

type Option = { kind: 'restaurant'; restaurant: Restaurant } | { kind: 'place'; place: AddressSuggestion };

/**
 * One field to find a restaurant: typing proposes the restaurants by name,
 * street or city, and the places (town, postal code, address) to list the
 * closest ones from; "Autour de moi" uses the browser's position. The list
 * below then goes from the closest to the farthest, with the distance and
 * whether the restaurant delivers there.
 */
export function RestaurantFinder({
  restaurants,
  marks,
}: {
  restaurants: Restaurant[];
  marks: Map<string, ReviewSummary> | undefined;
}) {
  const navigate = useNavigate();
  const { place, setPlace } = useLocationStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [shown, setShown] = useState({ key: '', count: PAGE_SIZE });

  // Asks the geocoder once typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const placesQuery = useQuery({
    queryKey: ['place-suggestions', query],
    queryFn: () => restaurantsApi.suggestPlaces(query),
    enabled: query.length >= MIN_PLACE_CHARS,
    staleTime: 5 * 60_000,
  });

  const options: Option[] = useMemo(() => {
    const byName = matchRestaurants(restaurants, text)
      .slice(0, MAX_RESTAURANT_OPTIONS)
      .map((restaurant) => ({ kind: 'restaurant' as const, restaurant }));
    const places =
      query.length >= MIN_PLACE_CHARS && query === text.trim()
        ? relevantPlaces(placesQuery.data ?? [], query, restaurants).map((p) => ({ kind: 'place' as const, place: p }))
        : [];
    return [...byName, ...places];
  }, [restaurants, text, query, placesQuery.data]);

  const choosePlace = (next: Place | null) => {
    setPlace(next);
    setText('');
    setOpen(false);
    setLocateError('');
  };

  const pick = (option: Option | undefined) => {
    if (!option) return;
    if (option.kind === 'restaurant') {
      setOpen(false);
      navigate(`/restaurants/${option.restaurant.id}`);
    } else {
      choosePlace({ label: option.place.label, lat: option.place.latitude, lng: option.place.longitude });
    }
  };

  const locateMe = () => {
    setLocateError('');
    if (!('geolocation' in navigator)) {
      setLocateError('Votre navigateur ne permet pas de vous localiser : tapez votre ville ou votre adresse.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        choosePlace({ label: 'votre position', lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setLocateError('Position indisponible (autorisation refusée ?) : tapez votre ville ou votre adresse.');
      },
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  };

  const found = useMemo(() => listRestaurants(restaurants, place, openOnly), [restaurants, place, openOnly]);
  // A new place or filter starts again from the first page.
  const key = `${place?.lat},${place?.lng},${openOnly}`;
  const count = shown.key === key ? shown.count : PAGE_SIZE;

  const typing = text.trim().length > 0;
  const waiting = typing && (query !== text.trim() || placesQuery.isFetching);
  const showList = open && typing;

  return (
    <section id="restaurants" aria-labelledby="restaurants-title" className="scroll-mt-24">
      <h2 id="restaurants-title" className="font-display text-2xl font-bold text-brand sm:text-3xl">
        Trouver un restaurant
      </h2>
      <p className="mt-1 text-neutral-500">Tapez votre ville, votre code postal ou votre adresse.</p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <div className="flex items-center gap-2 rounded-xl border border-brand/15 bg-white px-4 py-3 shadow-sm focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
            <Search size={18} aria-hidden className="shrink-0 text-neutral-400" />
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={showList && options[active] ? `${listId}-${active}` : undefined}
              aria-label="Ville, code postal, adresse ou nom du restaurant"
              autoComplete="off"
              value={text}
              placeholder="Ex. : Rouen, 75006, 12 rue de Rivoli…"
              onChange={(e) => {
                setText(e.target.value);
                setOpen(true);
                setActive(0);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' && options.length) {
                  e.preventDefault();
                  setOpen(true);
                  setActive((i) => (i + 1) % options.length);
                } else if (e.key === 'ArrowUp' && options.length) {
                  e.preventDefault();
                  setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  pick(options[active] ?? options[0]);
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
              className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
            />
            {text && (
              <button
                type="button"
                aria-label="Effacer"
                onClick={() => {
                  setText('');
                  inputRef.current?.focus();
                }}
                className="shrink-0 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {showList && (
            <ul
              id={listId}
              role="listbox"
              className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-brand/10 bg-white py-1 shadow-[var(--shadow-lift)]"
            >
              {options.map((option, i) => {
                const first = i === 0 || options[i - 1].kind !== option.kind;
                return (
                  <li key={option.kind === 'restaurant' ? option.restaurant.id : option.place.label} role="presentation">
                    {first && (
                      <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        {option.kind === 'restaurant' ? 'Restaurants' : 'Voir les restaurants proches de…'}
                      </p>
                    )}
                    <div
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(option);
                      }}
                      onMouseEnter={() => setActive(i)}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 ${i === active ? 'bg-brand-pale' : ''}`}
                    >
                      {option.kind === 'restaurant' ? (
                        <>
                          <Store size={18} aria-hidden className="shrink-0 text-brand" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-brand">{option.restaurant.name}</span>
                            <span className="block truncate text-xs text-neutral-500">
                              {option.restaurant.address}, {option.restaurant.city}
                            </span>
                          </span>
                        </>
                      ) : (
                        <>
                          <MapPin size={18} aria-hidden className="shrink-0 text-neutral-500" />
                          <span className="truncate text-sm text-neutral-700">{option.place.label}</span>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
              {options.length === 0 && (
                <li className="px-4 py-3 text-sm text-neutral-500">
                  {waiting
                    ? 'Recherche…'
                    : text.trim().length < MIN_PLACE_CHARS
                      ? 'Continuez à taper…'
                      : 'Aucun résultat : essayez une ville ou un code postal.'}
                </li>
              )}
            </ul>
          )}
        </div>
        <Button variant="ghost" onClick={locateMe} disabled={locating} className="shrink-0 py-3">
          <LocateFixed size={18} aria-hidden />
          {locating ? 'Localisation…' : 'Autour de moi'}
        </Button>
      </div>
      {locateError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {locateError}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 font-semibold text-neutral-700" aria-live="polite">
          {place ? (
            <>
              Les plus proches de <span className="text-brand">{place.label}</span>
            </>
          ) : (
            `Tous nos restaurants (${restaurants.length})`
          )}
        </p>
        {place && (
          <button
            type="button"
            onClick={() => choosePlace(null)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand underline-offset-2 hover:underline"
          >
            <X size={14} aria-hidden /> Effacer le lieu
          </button>
        )}
        <button
          type="button"
          aria-pressed={openOnly}
          onClick={() => setOpenOnly((v) => !v)}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
            openOnly ? 'border-brand bg-brand text-white' : 'border-brand/20 bg-white text-brand hover:bg-brand-pale'
          }`}
        >
          Ouverts maintenant
        </button>
      </div>

      {found.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon="🌙" title="Aucun restaurant ouvert en ce moment" hint="Revenez un peu plus tard." />
          <div className="mt-3 text-center">
            <Button variant="ghost" onClick={() => setOpenOnly(false)}>
              Voir tous les restaurants
            </Button>
          </div>
        </div>
      ) : (
        <>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {found.slice(0, count).map((f, i) => (
              <li key={f.restaurant.id} className="flex">
                <RestaurantCard
                  found={f}
                  closest={!!place && i === 0 && f.distanceKm !== null}
                  summary={marks?.get(f.restaurant.id)}
                  onOpen={() => navigate(`/restaurants/${f.restaurant.id}`)}
                />
              </li>
            ))}
          </ul>
          {found.length > count && (
            <div className="mt-5 text-center">
              <Button variant="ghost" onClick={() => setShown({ key, count: count + PAGE_SIZE })}>
                Voir plus de restaurants ({found.length - count} autres)
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function RestaurantCard({
  found: { restaurant, distanceKm, delivers },
  closest,
  summary,
  onOpen,
}: {
  found: FoundRestaurant;
  closest: boolean;
  summary: ReviewSummary | undefined;
  onOpen: () => void;
}) {
  const open = isOpen(restaurant);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full flex-col gap-2 rounded-2xl border bg-white p-5 text-left transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
        closest ? 'border-brand/40 ring-1 ring-brand/20' : 'border-brand/10'
      }`}
    >
      {closest && (
        <span className="w-fit rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-brand-dark">Le plus proche</span>
      )}
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
            <ShoppingBag size={14} aria-hidden /> Trop loin pour livrer · à emporter
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
