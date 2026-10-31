import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bike, Clock, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { FavoriteButton } from '../components/FavoriteButton';
import { Spinner } from '../components/Spinner';
import { useRestaurantMenu, useRestaurantMenuPlans } from '../features/catalog/hooks/useMenu';
import type { MenuItem, MenuPlan } from '../features/catalog/types/menu.types';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { hoursOfDay } from '../features/restaurants/openingHours';
import type { Restaurant } from '../features/restaurants/types/restaurant.types';
import { RatingBadge, RestaurantReviews, useReviewSummaries } from '../features/reviews';
import { AllergenList } from '../features/catalog/components/AllergenList';
import { formatPhone, formatPrice } from '../utils/format';
import { useCartStore } from '../store/cartStore';
import { useLocationStore } from '../store/locationStore';
import { dishPhoto } from '../utils/images';

const ALL = 'Tous';
const FORMULES = 'Formules';

/** A formule goes to the cart like a dish; its dishes are listed as its content. */
function planAsItem(plan: MenuPlan, dishes: MenuItem[]): MenuItem {
  const names = plan.dishIds.map((id) => dishes.find((d) => d.id === id)?.name).filter(Boolean) as string[];
  return {
    id: plan.id,
    restaurantId: plan.restaurantId,
    name: plan.name,
    description: plan.description || names.join(' + '),
    priceCents: plan.priceCents,
    category: FORMULES,
    emoji: plan.emoji,
    rating: 0,
    available: plan.available,
    ingredients: names,
    allergens: [...new Set(plan.dishIds.flatMap((id) => dishes.find((d) => d.id === id)?.allergens ?? []))],
    isGlobal: plan.isGlobal,
    hiddenForViewer: plan.hiddenForViewer,
    imageUrl: plan.imageUrl,
  };
}

export function RestaurantMenuPage() {
  const { id: restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const { data: menu, isLoading } = useRestaurantMenu(restaurantId);
  const { data: plans } = useRestaurantMenuPlans(restaurantId);
  const { data: restaurants } = useRestaurants();
  const { data: marks } = useReviewSummaries(restaurantId ? [restaurantId] : []);
  const add = useCartStore((s) => s.add);
  const [category, setCategory] = useState<string>(searchParams.get('category') ?? ALL);
  const query = (searchParams.get('q') ?? '').toLowerCase();

  useEffect(() => {
    const fromUrl = searchParams.get('category');
    if (fromUrl) setCategory(fromUrl);
  }, [searchParams]);

  // The homepage and the header search follow the restaurant last opened.
  const remember = useLocationStore((s) => s.setRestaurantId);
  useEffect(() => {
    if (restaurantId) remember(restaurantId);
  }, [restaurantId, remember]);

  const restaurant = restaurants?.find((r) => r.id === restaurantId);
  const catalog = useMemo(() => {
    const dishes = menu ?? [];
    const formules = (plans ?? []).filter((p) => p.available).map((p) => planAsItem(p, dishes));
    return [...formules, ...dishes];
  }, [menu, plans]);
  const categories = useMemo(() => [ALL, ...new Set(catalog.map((m) => m.category))], [catalog]);

  if (isLoading) return <Spinner label="Chargement du menu…" />;

  const items = (category === ALL ? catalog : catalog.filter((m) => m.category === category)).filter(
    (m) => !query || m.name.toLowerCase().includes(query) || m.description.toLowerCase().includes(query),
  );
  const closed = !!restaurant && (restaurant.isOpenNow === false || restaurant.acceptingOrders === false);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Retour à l’accueil
      </Link>

      <header className="brand-texture overflow-hidden rounded-3xl bg-brand px-6 py-7 text-white sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{restaurant?.name ?? 'Restaurant'}</h1>
            {restaurant && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                <MapPin size={14} aria-hidden /> {restaurant.address}, {restaurant.city}
              </p>
            )}
          </div>
          <FavoriteButton kind="restaurant" targetId={restaurant?.id} />
        </div>
        {restaurant && <RestaurantFacts restaurant={restaurant} />}
        <div className="mt-3 rounded-full bg-white/95 px-3 py-1 text-brand sm:inline-flex">
          <RatingBadge summary={restaurantId ? marks?.get(restaurantId) : undefined} />
        </div>
      </header>

      {closed && (
        <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {restaurant?.acceptingOrders === false
            ? 'Ce restaurant ne prend pas de commandes pour le moment. Revenez un peu plus tard.'
            : 'Ce restaurant est fermé pour le moment. Vous pouvez consulter la carte et commander pendant ses horaires d’ouverture.'}
        </p>
      )}

      {catalog.length === 0 ? (
        <EmptyState icon="🍽️" title="Menu vide" hint="Ce restaurant n’a pas encore d’articles." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Catégories">
            {categories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === c
                    ? 'bg-brand text-white shadow-[var(--shadow-lift)]'
                    : 'bg-white text-neutral-500 hover:text-brand'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <EmptyState icon="🔍" title="Aucun résultat" hint="Essayez une autre recherche ou catégorie." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  index={i}
                  disabled={closed}
                  onAdd={() => restaurant && add(item, { id: restaurant.id, name: restaurant.name })}
                />
              ))}
            </div>
          )}
          <p className="text-xs text-neutral-400">
            Prix TTC. Les allergènes de chaque plat sont indiqués sur sa fiche ; en cas de doute, contactez le
            restaurant{restaurant?.phone ? ` au ${formatPhone(restaurant.phone)}` : ''} avant de commander.
          </p>
        </>
      )}

      {restaurantId && <RestaurantReviews restaurantId={restaurantId} />}
    </div>
  );
}

function RestaurantFacts({ restaurant }: { restaurant: Restaurant }) {
  const today = hoursOfDay(restaurant.openingHours, new Date().getDay());
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
      <li className="flex items-center gap-1.5">
        <Clock size={15} aria-hidden />
        <span className={restaurant.isOpenNow ? 'font-semibold text-accent' : 'font-semibold text-white/60'}>
          {restaurant.isOpenNow ? 'Ouvert' : 'Fermé'}
        </span>
        {today ? `· aujourd’hui ${today}` : '· fermé aujourd’hui'}
      </li>
      {!!restaurant.prepTimeMinutes && (
        <li className="flex items-center gap-1.5">
          <ShoppingBag size={15} aria-hidden /> Prêt en ~{restaurant.prepTimeMinutes} min
        </li>
      )}
      <li className="flex items-center gap-1.5">
        <Bike size={15} aria-hidden />
        Livraison {restaurant.deliveryFeeCents ? formatPrice(restaurant.deliveryFeeCents) : 'offerte'}
        {!!restaurant.minimumOrderCents && ` · minimum ${formatPrice(restaurant.minimumOrderCents)}`}
      </li>
    </ul>
  );
}

function MenuCard({
  item,
  onAdd,
  index,
  disabled,
}: {
  item: MenuItem;
  onAdd: () => void;
  index: number;
  disabled: boolean;
}) {
  const isFormule = item.category === FORMULES;
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
      style={{ animation: 'rise 0.5s both', animationDelay: `${index * 40}ms` }}
    >
      <div
        className="relative h-36 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl || dishPhoto(item.name, item.category)})` }}
        role="img"
        aria-label={item.name}
      >
        {isFormule ? (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-brand">
            Formule
          </span>
        ) : (
          <FavoriteButton kind="dish" targetId={item.id} className="absolute right-2 top-2" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display font-bold text-brand">{item.name}</h3>
        <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
        {isFormule && item.ingredients.length > 0 && item.description !== item.ingredients.join(' + ') && (
          <p className="mt-1 text-xs text-neutral-400">Comprend : {item.ingredients.join(', ')}</p>
        )}
        <AllergenList allergens={item.allergens} className="mt-2" />
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-display text-lg font-extrabold text-brand">{formatPrice(item.priceCents)}</span>
          <Button
            variant="accent"
            onClick={onAdd}
            disabled={disabled}
            className="px-4 py-2"
            aria-label={`Ajouter ${item.name} au panier`}
          >
            Ajouter
          </Button>
        </div>
      </div>
    </article>
  );
}
