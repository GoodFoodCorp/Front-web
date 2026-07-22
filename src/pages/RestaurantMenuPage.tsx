import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useRestaurantMenu } from '../features/catalog/hooks/useMenu';
import type { MenuItem } from '../features/catalog/types/menu.types';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { formatPrice } from '../utils/format';
import { useCartStore } from '../store/cartStore';

const ALL = 'Tous';

export function RestaurantMenuPage() {
  const { id: restaurantId } = useParams();
  const { data: menu, isLoading } = useRestaurantMenu(restaurantId);
  const { data: restaurants } = useRestaurants();
  const add = useCartStore((s) => s.add);
  const [category, setCategory] = useState<string>(ALL);

  const restaurant = restaurants?.find((r) => r.id === restaurantId);
  const categories = useMemo(() => {
    const set = new Set<string>();
    menu?.forEach((m) => set.add(m.category));
    return [ALL, ...set];
  }, [menu]);

  if (isLoading) return <Spinner label="Chargement du menu…" />;

  const items = category === ALL ? menu ?? [] : (menu ?? []).filter((m) => m.category === category);

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
        <ArrowLeft size={16} /> Tous les restaurants
      </Link>

      <div className="brand-texture overflow-hidden rounded-3xl bg-brand px-8 py-8 text-white">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
          {restaurant?.name ?? 'Restaurant'}
        </h1>
        <p className="mt-1 text-white/70">Composez votre commande dans ce restaurant.</p>
      </div>

      {!menu || menu.length === 0 ? (
        <EmptyState icon="🍽️" title="Menu vide" hint="Ce restaurant n'a pas encore d'articles." />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
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

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <MenuCard
                key={item.id}
                item={item}
                index={i}
                onAdd={() =>
                  restaurant && add(item, { id: restaurant.id, name: restaurant.name })
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MenuCard({ item, onAdd, index }: { item: MenuItem; onAdd: () => void; index: number }) {
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
      style={{ animation: 'rise 0.5s both', animationDelay: `${index * 40}ms` }}
    >
      <div className="grid h-36 place-items-center bg-gradient-to-br from-brand-pale to-accent/20 text-6xl">
        {item.emoji}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-brand">{item.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-neutral-500">
            <Star size={13} className="fill-accent text-accent" /> {item.rating || '—'}
          </span>
        </div>
        <p className="mt-1 flex-1 text-sm text-neutral-500">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg font-extrabold text-brand">
            {formatPrice(item.priceCents)}
          </span>
          <Button variant="accent" onClick={onAdd} className="px-4 py-2">
            Ajouter
          </Button>
        </div>
      </div>
    </article>
  );
}
