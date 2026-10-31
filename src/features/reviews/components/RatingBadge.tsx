import { Star } from 'lucide-react';
import type { ReviewSummary } from '../reviewsApi';
import { formatRating } from '../rating';

/** "★ 4,3 (12 avis)" on a restaurant card; "Nouveau" before the first review. */
export function RatingBadge({ summary, className = '' }: { summary: ReviewSummary | undefined; className?: string }) {
  if (!summary || summary.count === 0) {
    return <span className={`text-xs font-semibold text-neutral-400 ${className}`}>Nouveau · pas encore d’avis</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 ${className}`}>
      <Star size={14} className="fill-accent text-accent" aria-hidden />
      {formatRating(summary.average)}
      <span className="font-normal text-neutral-400">({summary.count} avis)</span>
    </span>
  );
}
