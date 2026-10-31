import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, MapPin, Search, Store } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useDishSearch } from '../features/catalog/hooks/useMenu';
import { groupDishes, type DishResult } from '../features/catalog/dishSearch';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { formatDistance, isOpen, matchRestaurants } from '../features/restaurants/finder';
import { useLocationStore } from '../store/locationStore';
import { formatPrice } from '../utils/format';

const DEBOUNCE_MS = 300;
const SHOWN_OFFERS = 4;

/**
 * Search the whole network: the restaurants by name, street or city, and the
 * dishes with every restaurant serving them, so the customer picks where to
 * order (the closest first when they gave a place on the homepage).
 */
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [text, setText] = useState(searchParams.get('q') ?? '');
  const [query, setQuery] = useState(text.trim());
  const place = useLocationStore((s) => s.place);
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants();
  const { data: matches, isFetching } = useDishSearch(query);

  // The URL follows the typing (shareable, back button), once it pauses.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(text.trim());
      setSearchParams(text.trim() ? { q: text.trim() } : {}, { replace: true });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, setSearchParams]);

  const restaurantResults = useMemo(() => matchRestaurants(restaurants, query), [restaurants, query]);
  const dishResults = useMemo(() => groupDishes(matches ?? [], restaurants, place), [matches, restaurants, place]);
  const tooShort = query.length < 2;
  const searching = !tooShort && (isFetching || query !== text.trim());

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Tous les restaurants
      </Link>
      <h1 className="font-display text-3xl font-bold text-brand">Rechercher</h1>

      <div className="flex items-center gap-2 rounded-xl border border-brand/15 bg-white px-4 py-3 shadow-sm focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <Search size={18} aria-hidden className="shrink-0 text-neutral-400" />
        <input
          type="search"
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Un plat, un restaurant, une ville…"
          aria-label="Rechercher un plat ou un restaurant"
          className="w-full bg-transparent text-base outline-none placeholder:text-neutral-400"
        />
      </div>
      {place && (
        <p className="flex items-center gap-1.5 text-sm text-neutral-500">
          <MapPin size={14} aria-hidden /> Restaurants classés du plus proche au plus loin de {place.label}
        </p>
      )}

      {tooShort ? (
        <EmptyState icon="🔎" title="Que cherchez-vous ?" hint="Tapez au moins 2 lettres : burger, salade, Rouen…" />
      ) : restaurantsLoading || (searching && !matches) ? (
        <Spinner label="Recherche…" />
      ) : restaurantResults.length === 0 && dishResults.length === 0 ? (
        <EmptyState icon="🍽️" title={`Aucun résultat pour « ${query} »`} hint="Vérifiez l’orthographe ou essayez un mot plus court." />
      ) : (
        <>
          {restaurantResults.length > 0 && (
            <section aria-labelledby="search-restaurants" className="space-y-3">
              <h2 id="search-restaurants" className="font-display text-xl font-bold text-brand">
                Restaurants ({restaurantResults.length})
              </h2>
              <ul className="divide-y divide-brand/10 overflow-hidden rounded-2xl border border-brand/10 bg-white">
                {restaurantResults.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/restaurants/${r.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-brand-pale"
                    >
                      <Store size={18} aria-hidden className="shrink-0 text-brand" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-brand">{r.name}</span>
                        <span className="block truncate text-xs text-neutral-500">
                          {r.address}, {r.city}
                        </span>
                      </span>
                      <ChevronRight size={18} aria-hidden className="shrink-0 text-neutral-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dishResults.length > 0 && (
            <section aria-labelledby="search-dishes" className="space-y-3">
              <h2 id="search-dishes" className="font-display text-xl font-bold text-brand">
                Plats ({dishResults.length})
              </h2>
              <ul className="space-y-4">
                {dishResults.map((dish) => (
                  <li key={dish.name}>
                    <DishCard dish={dish} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function DishCard({ dish }: { dish: DishResult }) {
  const [all, setAll] = useState(false);
  const offers = all ? dish.offers : dish.offers.slice(0, SHOWN_OFFERS);
  return (
    <article className="overflow-hidden rounded-2xl border border-brand/10 bg-white">
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-brand">{dish.name}</h3>
          <span className="shrink-0 rounded-full border border-brand/15 px-2 py-0.5 text-xs text-brand">{dish.category}</span>
        </div>
        {dish.description && <p className="mt-1 text-sm text-neutral-500">{dish.description}</p>}
        <p className="mt-1 text-sm text-neutral-600">
          Dans {dish.offers.length} restaurant{dish.offers.length > 1 ? 's' : ''}
          {dish.offers.length > 1 ? `, à partir de ${formatPrice(dish.fromCents)}` : ''}
        </p>
      </div>
      <ul className="divide-y divide-brand/10 border-t border-brand/10">
        {offers.map(({ restaurant, item, distanceKm }) => {
          const open = isOpen(restaurant);
          return (
            <li key={restaurant.id}>
              <Link
                to={`/restaurants/${restaurant.id}?q=${encodeURIComponent(item.name)}`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-brand-pale"
                aria-label={`Commander ${item.name} chez ${restaurant.name}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-neutral-800">{restaurant.name}</span>
                  <span className="block truncate text-xs text-neutral-500">
                    {restaurant.city}
                    {distanceKm !== null && ` · ${formatDistance(distanceKm)}`}
                    {open ? '' : ' · fermé pour le moment'}
                  </span>
                </span>
                <span className="shrink-0 font-display font-extrabold text-brand">{formatPrice(item.priceCents)}</span>
                <span
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    open ? 'bg-accent text-brand-dark' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {open ? 'Commander' : 'Voir'}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {dish.offers.length > SHOWN_OFFERS && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="w-full border-t border-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand-pale"
        >
          {all ? 'Voir moins' : `Voir les ${dish.offers.length} restaurants`}
        </button>
      )}
    </article>
  );
}
