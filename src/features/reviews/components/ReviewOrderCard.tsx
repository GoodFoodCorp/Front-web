import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { useOrderReview, useReviewOrder } from '../useReviews';
import { StarPicker } from './StarPicker';
import { Stars } from './Stars';

const MAX_COMMENT = 500;

/** Once the order is received, its customer rates the restaurant (verified review). */
export function ReviewOrderCard({ orderId, restaurantName }: { orderId: string; restaurantName: string }) {
  const { data: review, isLoading } = useOrderReview(orderId, true);
  const send = useReviewOrder();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (isLoading) return null;
  if (review) {
    return (
      <Card className="space-y-2">
        <h2 className="font-display font-bold text-brand">Votre avis sur {restaurantName}</h2>
        <Stars value={review.rating} size={18} />
        {review.comment && <p className="break-words text-sm text-neutral-600">« {review.comment} »</p>}
        <p className="text-xs text-neutral-400">
          Publié le {new Date(review.created_at).toLocaleDateString('fr-FR')}. Merci !
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (rating) send.mutate({ orderId, rating, comment });
        }}
      >
        <div>
          <h2 className="font-display font-bold text-brand">Comment était {restaurantName} ?</h2>
          <p className="text-sm text-neutral-500">Votre avis aide les autres clients et le restaurant.</p>
        </div>
        <StarPicker name={`rating-${orderId}`} value={rating} onChange={setRating} />
        <div>
          <label htmlFor={`review-${orderId}`} className="mb-1 block text-sm font-semibold text-neutral-700">
            Un commentaire ? <span className="font-normal text-neutral-400">(facultatif)</span>
          </label>
          <textarea
            id={`review-${orderId}`}
            value={comment}
            maxLength={MAX_COMMENT}
            rows={3}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ce que vous avez aimé, ce qui pourrait être mieux…"
            className="w-full rounded-xl border border-brand/15 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <p className="mt-1 text-right text-xs text-neutral-400">
            {comment.length} / {MAX_COMMENT}
          </p>
        </div>
        {send.isError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {(send.error as Error).message}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-sm text-xs text-neutral-400">
            Publié sur la page du restaurant sans votre nom, avec la date de votre commande. N’y indiquez pas de
            données personnelles.
          </p>
          <Button type="submit" disabled={!rating || send.isPending}>
            {send.isPending ? 'Envoi…' : 'Publier mon avis'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
