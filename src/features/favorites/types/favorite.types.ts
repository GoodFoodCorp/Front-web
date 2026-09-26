export type FavoriteKind = 'restaurant' | 'dish';

export interface Favorite {
  id: string;
  kind: FavoriteKind;
  targetId: string;
  createdAt: string;
}

/** Raw shape returned by user-service (snake_case). */
export interface FavoriteDto {
  id: string;
  kind: FavoriteKind;
  target_id: string;
  created_at: string;
}
