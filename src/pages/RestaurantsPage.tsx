import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Star, TrendingUp } from 'lucide-react';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { useRestaurantMenu } from '../features/catalog/hooks/useMenu';
import { useLocationStore } from '../store/locationStore';
import { useCartStore } from '../store/cartStore';
import type { MenuItem } from '../features/catalog/types/menu.types';
import { formatPrice } from '../utils/format';
import { HERO_PHOTO, PROMO_GREEN_PHOTO, PROMO_YELLOW_PHOTO, categoryPhoto, dishPhoto } from '../utils/images';

const PROMO_CODE = 'BIENVENUE20';

export function RestaurantsPage() {
  const navigate = useNavigate();
  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants();
  const { restaurantId } = useLocationStore();
  const current = restaurants?.find((r) => r.id === restaurantId) ?? restaurants?.[0];
  const { data: menu, isLoading: menuLoading } = useRestaurantMenu(current?.id);
  const add = useCartStore((s) => s.add);
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    (menu ?? []).forEach((item) => {
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    });
    return Array.from(byCategory.entries());
  }, [menu]);

  const popular = useMemo(() => {
    return [...(menu ?? [])].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
  }, [menu]);

  const goToMenu = (category?: string) => {
    if (!current) return;
    navigate(`/restaurants/${current.id}${category ? `?category=${encodeURIComponent(category)}` : ''}`);
  };

  const applyPromo = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
    } catch {
      /* clipboard may be unavailable — the code is shown either way */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (restaurantsLoading) return <Spinner label="Chargement…" />;

  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <EmptyState icon="🏪" title="Aucun restaurant" hint="Revenez plus tard." />
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden bg-brand bg-cover bg-center px-4 py-16 text-white sm:py-24"
        style={{ backgroundImage: `linear-gradient(rgba(0,68,48,0.82),rgba(0,68,48,0.82)), url(${HERO_PHOTO})` }}
      >
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Bienvenue chez Good Food !
          </h1>
          <p className="mt-3 max-w-md text-white/80">Les repas de qualité, à coté de chez vous !</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="accent" className="px-6 py-3" onClick={() => goToMenu()}>
              Commander maintenant
            </Button>
            <Button
              variant="ghost"
              className="border-white/40 bg-transparent px-6 py-3 text-white hover:bg-white/10"
              onClick={() => navigate('/reservations')}
            >
              <CalendarDays size={18} />
              Réserver une table
            </Button>
          </div>
        </div>
      </section>

      {/* ── Promo bar ── */}
      <section className="bg-accent px-4 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-brand-dark" />
            <div className="text-sm text-brand-dark">
              <p className="font-semibold">Offre à durée limitée</p>
              <p className="font-bold">
                Obtenez 20% de réduction sur votre première commande ! Code : {PROMO_CODE}
              </p>
            </div>
          </div>
          <Button onClick={applyPromo} className="shrink-0 px-4 py-2">
            {copied ? 'Code copié ✓' : 'Profiter maintenant'}
          </Button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10">
        {/* ── Offers ── */}
        <section>
          <h2 className="font-display text-2xl font-bold text-brand sm:text-3xl">Découvrez nos dernières offres</h2>
          <p className="mt-1 text-neutral-500">Ne manquez pas nos promotions exceptionnelles</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <OfferCard
              tone="brand"
              photo={PROMO_GREEN_PHOTO}
              title="20% de réduction sur votre première commande"
              subtitle={`Code promo : ${PROMO_CODE}`}
              onClick={() => goToMenu()}
            />
            <OfferCard
              tone="accent"
              photo={PROMO_YELLOW_PHOTO}
              title="Livraison Gratuite"
              subtitle="Sur les commandes de plus de 30 €"
              onClick={() => goToMenu()}
            />
          </div>
        </section>

        {/* ── Categories ── */}
        <section id="menu">
          <h2 className="font-display text-2xl font-bold text-brand sm:text-3xl">Nos Menus</h2>
          <p className="mt-1 text-neutral-500">Explorez nos différentes catégories</p>

          {menuLoading ? (
            <div className="mt-6">
              <Spinner label="Chargement du menu…" />
            </div>
          ) : categories.length === 0 ? (
            <div className="mt-6">
              <EmptyState icon="🍽️" title="Menu vide" hint="Ce restaurant n'a pas encore d'articles." />
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map(([category, items]) => (
                <button
                  key={category}
                  onClick={() => goToMenu(category)}
                  className="group overflow-hidden rounded-2xl border border-brand/10 bg-white text-left transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                >
                  <div
                    className="h-28 bg-cover bg-center"
                    style={{ backgroundImage: `url(${categoryPhoto(category)})` }}
                  />
                  <div className="px-3 py-3 text-center">
                    <p className="font-display font-bold text-brand">{category}</p>
                    <p className="text-xs text-neutral-400">
                      {items.length} menu{items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ── Popular dishes ── */}
        {popular.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold text-brand sm:text-3xl">Plats Populaires</h2>
            <p className="mt-1 text-neutral-500">Nos plats les plus appréciés par nos clients</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((item) => (
                <PopularDishCard key={item.id} item={item} onAdd={() => current && add(item, current)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function OfferCard({
  tone,
  photo,
  title,
  subtitle,
  onClick,
}: {
  tone: 'brand' | 'accent';
  photo: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  const isBrand = tone === 'brand';
  return (
    <div
      className={`flex overflow-hidden rounded-2xl ${isBrand ? 'bg-brand text-white' : 'bg-accent text-brand-dark'}`}
    >
      <div className="flex-1 p-6">
        <h3 className="font-display text-xl font-bold leading-snug">{title}</h3>
        <p className={`mt-2 text-sm ${isBrand ? 'text-white/80' : 'text-brand-dark/80'}`}>{subtitle}</p>
        <button
          onClick={onClick}
          className={`mt-5 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            isBrand ? 'bg-white text-brand hover:bg-white/90' : 'bg-brand-dark text-white hover:bg-black/80'
          }`}
        >
          En savoir plus <ArrowRight size={15} />
        </button>
      </div>
      <div
        className={`w-2/5 shrink-0 bg-cover bg-center ${isBrand ? 'opacity-70' : 'opacity-60'}`}
        style={{ backgroundImage: `url(${photo})` }}
      />
    </div>
  );
}

function PopularDishCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-brand/10 bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <div
        className="h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${dishPhoto(item.name, item.category)})` }}
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-bold text-brand">{item.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-neutral-500">
            <Star size={13} className="fill-accent text-accent" /> {item.rating || '—'}
          </span>
        </div>
        <span className="mt-1 inline-block w-fit rounded-full border border-brand/15 px-2 py-0.5 text-xs text-brand">
          {item.category}
        </span>
        <p className="mt-2 flex-1 text-sm text-neutral-500">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg font-extrabold text-brand">{formatPrice(item.priceCents)}</span>
          <Button variant="accent" onClick={onAdd} className="px-4 py-2 text-xs">
            Ajouter au panier
          </Button>
        </div>
      </div>
    </article>
  );
}
