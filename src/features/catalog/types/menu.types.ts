export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  emoji: string;
  rating: number;
  available: boolean;
}

/** Raw shape returned by menu-service (snake_case). */
export interface MenuItemDto {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  emoji: string;
  rating: number;
  available: boolean;
}

/** Payload for creating/updating an item (franchisee). */
export interface MenuItemForm {
  name: string;
  description: string;
  price_cents: number;
  category: string;
  emoji: string;
  available: boolean;
}
