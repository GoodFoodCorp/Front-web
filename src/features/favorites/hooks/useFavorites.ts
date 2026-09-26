import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '../api/favoritesApi';
import type { FavoriteKind } from '../types/favorite.types';

export function useFavorites() {
  return useQuery({ queryKey: ['favorites'], queryFn: favoritesApi.list });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, targetId }: { kind: FavoriteKind; targetId: string }) => favoritesApi.add(kind, targetId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, targetId }: { kind: FavoriteKind; targetId: string }) => favoritesApi.remove(kind, targetId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

/** Whether a given restaurant/dish is in the caller's favorites. */
export function useIsFavorite(kind: FavoriteKind, targetId: string | undefined) {
  const { data } = useFavorites();
  return !!targetId && !!data?.some((f) => f.kind === kind && f.targetId === targetId);
}

/** Star/unstar toggle, for a heart button next to a restaurant or dish. */
export function useToggleFavorite(kind: FavoriteKind, targetId: string | undefined) {
  const isFavorite = useIsFavorite(kind, targetId);
  const add = useAddFavorite();
  const remove = useRemoveFavorite();

  const toggle = () => {
    if (!targetId) return;
    if (isFavorite) remove.mutate({ kind, targetId });
    else add.mutate({ kind, targetId });
  };

  return { isFavorite, toggle, isPending: add.isPending || remove.isPending };
}
