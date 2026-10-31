import { ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useAuthStore } from '../../../store/authStore';
import { useRemoveReview, useRestaurantReviews } from '../useReviews';
import { formatRating } from '../rating';
import { Stars } from './Stars';

const day = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** A restaurant's verified reviews, newest first, with how they are collected. */
export function RestaurantReviews({ restaurantId }: { restaurantId: string }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useRestaurantReviews(restaurantId);
  const isAdmin = useAuthStore((s) => s.roles.includes('admin'));
  const remove = useRemoveReview();
  if (isLoading || !data) return null;

  const mark = data.pages[0];
  const reviews = data.pages.flatMap((p) => p.items);
  return (
    <section aria-labelledby="reviews-title" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="reviews-title" className="font-display text-xl font-bold text-brand">
          Avis clients
        </h2>
        <p className="flex items-center gap-1.5 text-xs text-neutral-500">
          <ShieldCheck size={14} className="text-brand" aria-hidden /> Avis vérifiés
        </p>
      </div>

      {mark.count === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand/20 bg-white p-6 text-center text-sm text-neutral-500">
          Pas encore d’avis. Commandez et soyez le premier à donner le vôtre.
        </p>
      ) : (
        <div className="grid gap-6 rounded-2xl border border-brand/10 bg-white p-5 sm:grid-cols-[auto_1fr]">
          <div className="text-center sm:pr-6">
            <p className="font-display text-4xl font-extrabold text-brand">{formatRating(mark.average)}</p>
            <Stars value={mark.average} />
            <p className="mt-1 text-xs text-neutral-500">{mark.count} avis</p>
          </div>
          <ul className="space-y-1" aria-label="Répartition des notes">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = mark.stars[n - 1];
              return (
                <li key={n} className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="w-3 text-right">{n}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <span
                      className="block h-full rounded-full bg-accent"
                      style={{ width: `${(100 * count) / mark.count}%` }}
                    />
                  </span>
                  <span className="w-6">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {reviews.length > 0 && (
        <ul className="divide-y divide-brand/10 rounded-2xl border border-brand/10 bg-white">
          {reviews.map((r) => (
            <li key={r.id} className="space-y-1.5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars value={r.rating} size={14} />
                <span className="text-xs text-neutral-400">Avis du {day(r.created_at)}</span>
              </div>
              {r.comment && <p className="whitespace-pre-line break-words text-sm text-neutral-700">{r.comment}</p>}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-neutral-400">Client vérifié · commande du {day(r.ordered_at)}</p>
                {isAdmin && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm('Retirer cet avis ? Il ne sera plus affiché ni compté dans la note.')) {
                        remove.mutate(r.id);
                      }
                    }}
                  >
                    Retirer l’avis
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {hasNextPage && (
        <Button variant="ghost" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Chargement…' : 'Voir plus d’avis'}
        </Button>
      )}

      <p className="text-xs leading-relaxed text-neutral-400">
        Seuls les clients ayant reçu leur commande peuvent donner un avis, une seule fois et dans les 30 jours. Les
        avis ne font l’objet d’aucune contrepartie et sont affichés du plus récent au plus ancien. Ils sont publiés
        sans contrôle préalable ; un avis illicite (injure, donnée personnelle, hors sujet) peut être retiré par Good
        Food.
      </p>
    </section>
  );
}
