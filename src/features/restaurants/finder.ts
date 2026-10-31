import type { Restaurant } from './types/restaurant.types';

/** Where the customer is: a picked address or the browser's position. */
export interface Place {
  label: string;
  lat: number;
  lng: number;
}

export type SortKey = 'distance' | 'rating' | 'name';

export interface FinderFilters {
  text: string;
  city: string;
  openOnly: boolean;
  deliversOnly: boolean;
  sort: SortKey;
}

export interface FoundRestaurant {
  restaurant: Restaurant;
  /** As the crow flies; null without a place or coordinates. */
  distanceKm: number | null;
  /** Within its delivery radius; null when it cannot be told. */
  delivers: boolean | null;
}

const EARTH_RADIUS_KM = 6371;

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** "é" matches "e", "Vieux-Marché" matches "vieux marche": what people type in a search box. */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function isOpen(r: Restaurant): boolean {
  return r.isOpenNow !== false && r.acceptingOrders !== false;
}

function locate(r: Restaurant, place: Place | null): FoundRestaurant {
  if (!place || r.latitude == null || r.longitude == null) return { restaurant: r, distanceKm: null, delivers: null };
  const km = distanceKm(place, { lat: r.latitude, lng: r.longitude });
  return { restaurant: r, distanceKm: km, delivers: r.deliveryRadiusKm ? km <= r.deliveryRadiusKm : null };
}

/** The cities served, most restaurants first. */
export function citiesOf(restaurants: Restaurant[]): { city: string; count: number }[] {
  const counts = new Map<string, number>();
  restaurants.forEach((r) => counts.set(r.city, (counts.get(r.city) ?? 0) + 1));
  return [...counts.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, 'fr'));
}

/**
 * Filters and orders the restaurants. Text matches the name, street, city or
 * postal code; the closest come first once a place is known, the restaurants
 * without coordinates last.
 */
export function findRestaurants(
  restaurants: Restaurant[],
  filters: FinderFilters,
  place: Place | null,
  averageOf: (id: string) => number | undefined,
): FoundRestaurant[] {
  const text = fold(filters.text);
  const found = restaurants
    .filter((r) => !filters.city || r.city === filters.city)
    .filter((r) => !filters.openOnly || isOpen(r))
    .filter((r) => !text || fold(`${r.name} ${r.address} ${r.city}`).includes(text))
    .map((r) => locate(r, place))
    .filter((f) => !filters.deliversOnly || f.delivers === true);

  const byName = (a: FoundRestaurant, b: FoundRestaurant) => a.restaurant.name.localeCompare(b.restaurant.name, 'fr');
  const sorters: Record<SortKey, (a: FoundRestaurant, b: FoundRestaurant) => number> = {
    distance: (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || byName(a, b),
    rating: (a, b) => (averageOf(b.restaurant.id) ?? 0) - (averageOf(a.restaurant.id) ?? 0) || byName(a, b),
    name: byName,
  };
  const sort = filters.sort === 'distance' && !place ? 'rating' : filters.sort;
  return found.sort(sorters[sort]);
}

/** "800 m", "2,4 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(100, Math.round(km * 10) * 100)} m`;
  return `${km.toLocaleString('fr-FR', { maximumFractionDigits: km < 10 ? 1 : 0 })} km`;
}
