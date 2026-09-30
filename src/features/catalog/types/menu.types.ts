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
  ingredients: string[];
  /** True when owned by head office and common to every restaurant. */
  isGlobal: boolean;
  /** True when *this* restaurant hid a global item for itself (see isGlobal). */
  hiddenForViewer: boolean;
  /** Uploaded photo as a data: URL, or "" if none was set (falls back to the emoji/stock photo). */
  imageUrl: string;
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
  ingredients: string[] | null;
  is_global: boolean;
  hidden_for_viewer: boolean;
  image_data_url: string;
}

/** Payload for creating/updating a dish (franchisee or, for a global dish, head office). */
export interface MenuItemForm {
  name: string;
  description: string;
  price_cents: number;
  category: string;
  emoji: string;
  available: boolean;
  ingredients: string[];
  image_data_url: string;
}

/** A "menu" (formule) — a named, priced bundle of dishes. */
export interface MenuPlan {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  priceCents: number;
  emoji: string;
  available: boolean;
  dishIds: string[];
  isGlobal: boolean;
  hiddenForViewer: boolean;
  imageUrl: string;
}

export interface MenuPlanDto {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price_cents: number;
  emoji: string;
  available: boolean;
  dish_ids: string[] | null;
  is_global: boolean;
  hidden_for_viewer: boolean;
  image_data_url: string;
}

export interface MenuPlanForm {
  name: string;
  description: string;
  price_cents: number;
  emoji: string;
  available: boolean;
  dish_ids: string[];
  image_data_url: string;
}

/** A dish category (Burgers, Pizzas, Boissons…) — network-wide, managed by head office. */
export interface Category {
  id: string;
  name: string;
}
