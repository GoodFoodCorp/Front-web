import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, TrendingUp } from 'lucide-react';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { useRestaurants } from '../features/restaurants/hooks/useRestaurants';
import { RestaurantFinder } from '../features/restaurants/components/RestaurantFinder';
import { useReviewSummaries } from '../features/reviews';
import { HERO_PHOTO, PROMO_GREEN_PHOTO, PROMO_YELLOW_PHOTO } from '../utils/images';

const PROMO_CODE = 'BIENVENUE20';

export function RestaurantsPage() {
  const navigate = useNavigate();
  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants();
  const [copied, setCopied] = useState(false);
  const { data: marks } = useReviewSummaries((restaurants ?? []).map((r) => r.id));

  const toFinder = () => document.getElementById('restaurants')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
          <p className="mt-3 max-w-md text-white/80">Les repas de qualité, à côté de chez vous !</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="accent" className="px-6 py-3" onClick={toFinder}>
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
              <p className="font-semibold">Offre de bienvenue</p>
              <p className="font-bold">
                −20 % sur votre première commande avec le code {PROMO_CODE}
              </p>
              <p className="text-xs">Valable une fois par client, sur le montant des plats.</p>
            </div>
          </div>
          <Button onClick={applyPromo} className="shrink-0 px-4 py-2">
            {copied ? 'Code copié ✓' : 'Profiter maintenant'}
          </Button>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10">
        <RestaurantFinder restaurants={restaurants} marks={marks} />

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
              onClick={toFinder}
            />
            <OfferCard
              tone="accent"
              photo={PROMO_YELLOW_PHOTO}
              title="À emporter, sans frais"
              subtitle="Commandez en ligne et retirez au restaurant : aucun frais de livraison"
              onClick={toFinder}
            />
          </div>
        </section>
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
