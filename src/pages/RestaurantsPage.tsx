import { Link } from 'react-router-dom';
import { Clock, MapPin, Star } from 'lucide-react';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import type { Restaurant } from '../features/restaurants/types/restaurant.types';

export function RestaurantsPage() {
  const { data: restaurants, isLoading } = useRestaurants();

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <section className="brand-texture relative overflow-hidden rounded-3xl bg-brand px-8 py-12 text-white">
        <div className="relative z-10 max-w-lg">
          <p className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-brand-dark">
            LIVRAISON · à côté de chez vous
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Choisissez votre restaurant
          </h1>
          <p className="mt-3 text-white/70">
            Chaque restaurant Good Food a son propre menu. Sélectionnez-en un pour commander.
          </p>
        </div>
        <span className="pointer-events-none absolute -right-6 -top-6 text-[10rem] opacity-20">🍔</span>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold text-brand">Restaurants disponibles</h2>
        {isLoading ? (
          <Spinner label="Chargement des restaurants…" />
        ) : !restaurants || restaurants.length === 0 ? (
          <EmptyState icon="🏪" title="Aucun restaurant" hint="Revenez plus tard." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.id} restaurant={r} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RestaurantCard({ restaurant, index }: { restaurant: Restaurant; index: number }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`}>
      <Card
        className="group flex flex-col gap-3 transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-[var(--shadow-lift)]"
        // eslint-disable-next-line
      >
        <div
          className="-m-5 mb-0 grid h-32 place-items-center rounded-t-2xl bg-gradient-to-br from-brand to-brand-light text-6xl"
          style={{ animation: 'rise 0.5s both', animationDelay: `${index * 50}ms` }}
        >
          🍽️
        </div>
        <div className="flex items-start justify-between">
          <h3 className="font-display text-lg font-bold text-brand">{restaurant.name}</h3>
          <span className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
            <Star size={13} className="fill-accent text-accent" /> 4.7
          </span>
        </div>
        <p className="text-sm text-neutral-500">Burgers · Pizzas · Salades · Desserts</p>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock size={13} /> 20–30 min
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={13} /> Livraison offerte
          </span>
        </div>
      </Card>
    </Link>
  );
}
