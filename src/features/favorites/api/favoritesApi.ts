import { http } from '../../../services/http';
import type { Favorite, FavoriteDto, FavoriteKind } from '../types/favorite.types';

function toFavorite(d: FavoriteDto): Favorite {
  return { id: d.id, kind: d.kind, targetId: d.target_id, createdAt: d.created_at };
}

/** Favorites are owned by user-service (both restaurant and dish favorites). */
export const favoritesApi = {
  list: async (): Promise<Favorite[]> => {
    const dtos = await http<FavoriteDto[]>('/api/users/me/favorites');
    return dtos.map(toFavorite);
  },

  add: async (kind: FavoriteKind, targetId: string): Promise<Favorite> =>
    toFavorite(
      await http<FavoriteDto>('/api/users/me/favorites', {
        method: 'POST',
        body: JSON.stringify({ kind, target_id: targetId }),
      }),
    ),

  remove: (kind: FavoriteKind, targetId: string): Promise<void> =>
    http(`/api/users/me/favorites/${kind}/${targetId}`, { method: 'DELETE' }),
};
