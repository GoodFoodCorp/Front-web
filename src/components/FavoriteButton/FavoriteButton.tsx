import { Heart } from 'lucide-react';
import { useToggleFavorite } from '../../features/favorites/hooks/useFavorites';
import type { FavoriteKind } from '../../features/favorites/types/favorite.types';
import { useAuthStore } from '../../store/authStore';

/** Pure UI heart toggle — favoriting is scoped to logged-in customers. */
export function FavoriteButton({
  kind,
  targetId,
  size = 18,
  className = '',
}: {
  kind: FavoriteKind;
  targetId: string | undefined;
  size?: number;
  className?: string;
}) {
  const isLoggedIn = !!useAuthStore((s) => s.accessToken);
  const { isFavorite, toggle, isPending } = useToggleFavorite(kind, targetId);

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }}
      disabled={isPending}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={isFavorite}
      className={`grid shrink-0 place-items-center rounded-full bg-white/90 p-2 text-neutral-400 shadow-sm transition hover:text-red-500 disabled:opacity-60 ${className}`}
    >
      <Heart size={size} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
    </button>
  );
}
