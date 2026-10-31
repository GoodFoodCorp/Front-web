import type { DishMatch, MenuItem } from './types/menu.types';
import { distanceKm, fold, isOpen, type Place } from '../restaurants/finder';
import type { Restaurant } from '../restaurants/types/restaurant.types';

/** A restaurant serving the dish, at its price there. */
export interface DishOffer {
  restaurant: Restaurant;
  item: MenuItem;
  distanceKm: number | null;
}

/** One dish as the customer sees it, whichever restaurants serve it. */
export interface DishResult {
  name: string;
  category: string;
  description: string;
  fromCents: number;
  offers: DishOffer[];
}

/**
 * Turns the search matches into one result per dish name, listing every
 * active restaurant serving it: a restaurant's own dish there, a global dish
 * in every restaurant that did not hide it. Restaurants come open first, then
 * closest (when a place is known), then by name.
 */
export function groupDishes(matches: DishMatch[], restaurants: Restaurant[], place: Place | null): DishResult[] {
  const byName = new Map<string, DishResult>();
  for (const { item, hiddenIn } of matches) {
    const serving = item.isGlobal
      ? restaurants.filter((r) => !hiddenIn.includes(r.id))
      : restaurants.filter((r) => r.id === item.restaurantId);
    if (serving.length === 0) continue;
    const key = fold(item.name);
    const result = byName.get(key) ?? {
      name: item.name,
      category: item.category,
      description: item.description,
      fromCents: item.priceCents,
      offers: [],
    };
    for (const restaurant of serving) {
      if (result.offers.some((o) => o.restaurant.id === restaurant.id)) continue;
      const km =
        place && restaurant.latitude != null && restaurant.longitude != null
          ? distanceKm(place, { lat: restaurant.latitude, lng: restaurant.longitude })
          : null;
      result.offers.push({ restaurant, item, distanceKm: km });
    }
    result.fromCents = Math.min(result.fromCents, item.priceCents);
    byName.set(key, result);
  }
  const results = [...byName.values()];
  for (const r of results) {
    r.offers.sort(
      (a, b) =>
        Number(isOpen(b.restaurant)) - Number(isOpen(a.restaurant)) ||
        (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) ||
        a.restaurant.name.localeCompare(b.restaurant.name, 'fr'),
    );
  }
  return results;
}
