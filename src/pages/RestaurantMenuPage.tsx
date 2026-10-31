import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bike, Clock, MapPin, ShoppingBag, ShoppingCart, X } from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { FavoriteButton } from '../components/FavoriteButton';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { useRestaurantMenu, useRestaurantMenuPlans } from '../features/catalog/hooks/useMenu';
import type { MenuItem, MenuPlan } from '../features/catalog/types/menu.types';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { DAY_NAMES, DAY_ORDER, hoursOfDay, openingLabel } from '../features/restaurants/openingHours';
import type { Restaurant } from '../features/restaurants/types/restaurant.types';
import { RatingBadge, RestaurantReviews, useReviewSummaries } from '../features/reviews';
import { AllergenList } from '../features/catalog/components/AllergenList';
import { formatPhone, formatPrice } from '../utils/format';
import { useCartStore } from '../store/cartStore';
import { fold } from '../features/restaurants/finder';
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: menu, isLoading } = useRestaurantMenu(restaurantId);
  const { data: plans } = useRestaurantMenuPlans(restaurantId);
  const { data: restaurants } = useRestaurants();
  const { data: marks } = useReviewSummaries(restaurantId ? [restaurantId] : []);
  const cart = useCartStore();
  const [category, setCategory] = useState<string>(searchParams.get('category') ?? ALL);
  const rawQuery = searchParams.get('q') ?? '';
  const query = fold(rawQuery);
  // A dish of another restaurant waits for the customer to agree to empty the cart.
  const [pending, setPending] = useState<MenuItem | null>(null);

  useEffect(() => {
    const fromUrl = searchParams.get('category');
    if (fromUrl) setCategory(fromUrl);
  }, [searchParams]);

  const restaurant = restaurants?.find((r) => r.id === restaurantId);
  const catalog = useMemo(() => {
    const dishes = menu ?? [];
    const formules = (plans ?? []).filter((p) => p.available).map((p) => planAsItem(p, dishes));
    return [...formules, ...dishes];
  }, [menu, plans]);
  const categories = useMemo(() => [ALL, ...new Set(catalog.map((m) => m.category))], [catalog]);

  if (isLoading) return <Spinner label="Chargement du menu…" />;

  const items = (category === ALL ? catalog : catalog.filter((m) => m.category === category)).filter(
    (m) => !query || fold(`${m.name} ${m.description} ${m.category}`).includes(query),
  );
  const opening = restaurant ? openingLabel(restaurant) : null;
  const closed = !!opening && !opening.open;
  const cartHere = cart.restaurantId === restaurantId && cart.lines.length > 0;
  const cartElsewhere = !!cart.restaurantId && cart.restaurantId !== restaurantId && cart.lines.length > 0;

  const addToCart = (item: MenuItem) => {
    if (!restaurant) return;
    if (cartElsewhere) setPending(item);
    else cart.add(item, { id: restaurant.id, name: restaurant.name });
  };

  const clearQuery = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className={`mx-auto max-w-6xl space-y-6 px-4 py-8 ${cartHere ? 'pb-28' : ''}`}>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Tous les restaurants
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

      {closed && restaurant && (
        <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {closedNotice(restaurant)}
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

          {rawQuery && (
            <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
              Plats correspondant à « <strong className="text-brand">{rawQuery}</strong> »
              <button
                type="button"
                onClick={clearQuery}
                className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-white px-3 py-1 font-semibold text-brand transition hover:bg-brand-pale"
              >
                <X size={14} aria-hidden /> Voir toute la carte
              </button>
            </p>
          )}

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
                  onAdd={() => addToCart(item)}
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

      {cartHere && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-brand/10 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">
              <strong className="text-brand">{cart.count()} article{cart.count() > 1 ? 's' : ''}</strong> ·{' '}
              {formatPrice(cart.totalCents())}
            </p>
            <Button variant="accent" onClick={() => navigate('/cart')} className="px-5 py-2.5">
              <ShoppingCart size={18} aria-hidden /> Voir mon panier
            </Button>
          </div>
        </div>
      )}

      {pending && restaurant && (
        <Modal title="Commencer un nouveau panier ?" onClose={() => setPending(null)} maxWidth="max-w-md">
          <div className="space-y-4 p-5">
            <p className="text-sm text-neutral-600">
              Votre panier contient des plats de <strong className="text-brand">{cart.restaurantName}</strong>. Une
              commande se passe auprès d’un seul restaurant : vider le panier pour commander chez{' '}
              <strong className="text-brand">{restaurant.name}</strong> ?
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setPending(null)}>
                Garder mon panier
              </Button>
              <Button
                onClick={() => {
                  cart.add(pending, { id: restaurant.id, name: restaurant.name });
                  setPending(null);
                }}
              >
                Vider et ajouter
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Why ordering is not possible now, and when it will be. */
function closedNotice(restaurant: Restaurant): string {
  const { detail } = openingLabel(restaurant);
  switch (restaurant.openState) {
    case 'CLOSED_BY_RESTAURANT':
      return 'Ce restaurant est fermé temporairement et ne prend pas de commandes pour le moment. Revenez un peu plus tard.';
    case 'OUTSIDE_HOURS':
      return `Ce restaurant est fermé pour le moment${detail ? ` : il ${detail}` : ''}. Vous pouvez consulter la carte en attendant.`;
    case 'NO_HOURS':
      return 'Ce restaurant n’a pas encore communiqué ses horaires : il ne prend pas de commandes pour le moment.';
    default:
      return 'Ce restaurant ne prend pas de commandes pour le moment.';
  }
}

function RestaurantFacts({ restaurant }: { restaurant: Restaurant }) {
  const opening = openingLabel(restaurant);
  const today = new Date().getDay();
  return (
    <>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
        <li className="flex items-center gap-1.5">
          <Clock size={15} aria-hidden />
          <span className={opening.open ? 'font-semibold text-accent' : 'font-semibold text-white/60'}>{opening.badge}</span>
          {opening.detail && `· ${opening.detail}`}
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
      {(restaurant.openingHours?.length ?? 0) > 0 && (
        <details className="mt-3 text-sm text-white/85">
          <summary className="w-fit cursor-pointer underline decoration-white/40 underline-offset-2 hover:decoration-white">
            Horaires de la semaine
          </summary>
          <ul className="mt-2 w-fit min-w-64 space-y-0.5 rounded-xl bg-white/10 px-3 py-2 text-white/90">
            {DAY_ORDER.map((d) => (
              <li key={d} className={`flex justify-between gap-6 ${d === today ? 'font-semibold text-white' : ''}`}>
                <span>{DAY_NAMES[d]}</span>
                <span>{hoursOfDay(restaurant.openingHours, d) || 'Fermé'}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
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
