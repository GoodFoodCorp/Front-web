/**
 * Front-only photo mapping for menu categories/items.
 *
 * The backend data model only carries an `emoji` per item (no image URLs) —
 * see menu-service. Rather than touching every service to add a media
 * pipeline, we map category/dish names to curated stock photos here so the
 * storefront and back-office look like the Figma mockups. Purely cosmetic;
 * the emoji stays the source of truth for identity.
 */

const UNSPLASH = (id: string, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/** One representative photo per menu category (French labels, as used across services). */
const CATEGORY_PHOTOS: Record<string, string> = {
  Burgers: UNSPLASH('photo-1568901346375-23c9450c58cd'),
  Salades: UNSPLASH('photo-1512621776951-a57141f2eefd'),
  Pizza: UNSPLASH('photo-1513104890138-7c749659a591'),
  Pizzas: UNSPLASH('photo-1513104890138-7c749659a591'),
  Wraps: UNSPLASH('photo-1626700051175-6818013e1d4f'),
  Pâtes: UNSPLASH('photo-1621996346565-e3dbc646d9a9'),
  Desserts: UNSPLASH('photo-1551024506-0bccd828d307'),
  Boissons: UNSPLASH('photo-1544145945-f90425340c7e'),
};

/** A few named dishes get a closer match than their category default. */
const DISH_PHOTOS: Record<string, string> = {
  'Burger Deluxe': UNSPLASH('photo-1568901346375-23c9450c58cd'),
  'Burger Classique': UNSPLASH('photo-1571091718767-18b5b1457add'),
  'Salade César': UNSPLASH('photo-1550304943-4f24f54ddde9'),
  'Pizza Pepperoni': UNSPLASH('photo-1628840042765-356cda07504e'),
  'Pizza Margherita': UNSPLASH('photo-1574071318508-1cdbab80d002'),
  'Wrap Végétarien': UNSPLASH('photo-1626700051175-6818013e1d4f'),
  'Wrap au Poulet': UNSPLASH('photo-1626700051175-6818013e1d4f'),
  'Pâtes Bolognaise': UNSPLASH('photo-1621996346565-e3dbc646d9a9'),
  'Gâteau aux Fraises': UNSPLASH('photo-1565958011703-44f9829ba187'),
};

const FALLBACK = UNSPLASH('photo-1504674900247-0877df9cc836');

export function dishPhoto(name: string, category?: string): string {
  return DISH_PHOTOS[name] ?? (category && CATEGORY_PHOTOS[category]) ?? FALLBACK;
}

export function categoryPhoto(category: string): string {
  return CATEGORY_PHOTOS[category] ?? FALLBACK;
}

/** Restaurant/franchise storefront photos, cycled by index so cards differ. */
const RESTAURANT_PHOTOS = [
  UNSPLASH('photo-1552566626-52f8b828add9'),
  UNSPLASH('photo-1517248135467-4c7edcad34c4'),
  UNSPLASH('photo-1467003909585-2f8a72700288'),
  UNSPLASH('photo-1517705008128-361805f42e86'),
  UNSPLASH('photo-1414235077428-338989a2e8c0'),
  UNSPLASH('photo-1424847651672-bf20a4b0982b'),
];

export function restaurantPhoto(index: number): string {
  return RESTAURANT_PHOTOS[index % RESTAURANT_PHOTOS.length];
}

export const HERO_PHOTO = UNSPLASH('photo-1414235077428-338989a2e8c0', 1600);
export const PROMO_GREEN_PHOTO = UNSPLASH('photo-1555396273-367ea4eb4db5', 900);
export const PROMO_YELLOW_PHOTO = UNSPLASH('photo-1414235077428-338989a2e8c0', 900);
