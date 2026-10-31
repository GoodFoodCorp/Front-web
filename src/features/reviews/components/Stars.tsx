import { Star } from 'lucide-react';
import { formatRating } from '../rating';

/** Five stars filled to the mark (rounded), read out as "4,3 sur 5". */
export function Stars({ value, size = 16, className = '' }: { value: number; size?: number; className?: string }) {
  const filled = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role="img" aria-label={`Note : ${formatRating(value)} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          aria-hidden
          className={n <= filled ? 'fill-accent text-accent' : 'fill-neutral-200 text-neutral-200'}
        />
      ))}
    </span>
  );
}
