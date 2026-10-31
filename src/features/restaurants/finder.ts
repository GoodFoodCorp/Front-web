import type { AddressSuggestion, Restaurant } from './types/restaurant.types';

/** Where the customer is: a picked town, postal code, address or the browser's position. */
export interface Place {
  label: string;
  lat: number;
  lng: number;
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

/** Restaurants whose name, street or city contain what was typed. */
export function matchRestaurants(restaurants: Restaurant[], text: string): Restaurant[] {
  const q = fold(text);
  if (!q) return [];
  return restaurants.filter((r) => fold(`${r.name} ${r.address} ${r.city}`).includes(q));
}

/**
 * Beyond this, a place is far from every restaurant: a namesake abroad
 * ("Rouen, Bulgarie"), not a big town without a restaurant yet (Lyon).
 */
const FAR_FROM_NETWORK_KM = 1000;

/**
 * The geocoder matches loosely ("rouen" also brings a street of Dijon): keep
 * the places naming every word typed, unless that leaves none. Places far
 * from every restaurant ("Rouen, Bulgarie") come last.
 */
export function relevantPlaces(places: AddressSuggestion[], text: string, restaurants: Restaurant[] = []): AddressSuggestion[] {
  const words = fold(text).split(' ').filter((w) => w.length >= 3);
  const strict = places.filter((p) => words.every((w) => fold(p.label).includes(w)));
  const kept = strict.length > 0 ? strict : places;
  const located = restaurants.filter((r) => r.latitude != null && r.longitude != null);
  if (located.length === 0) return kept;
  const far = (p: AddressSuggestion) =>
    located.every((r) => distanceKm({ lat: p.latitude, lng: p.longitude }, { lat: r.latitude!, lng: r.longitude! }) > FAR_FROM_NETWORK_KM);
  return [...kept.filter((p) => !far(p)), ...kept.filter(far)];
}

/**
 * Every restaurant, the closest first once a place is known (those without
 * coordinates last), else by city then name.
 */
export function listRestaurants(restaurants: Restaurant[], place: Place | null, openOnly: boolean): FoundRestaurant[] {
  const byCityThenName = (a: FoundRestaurant, b: FoundRestaurant) =>
    a.restaurant.city.localeCompare(b.restaurant.city, 'fr') || a.restaurant.name.localeCompare(b.restaurant.name, 'fr');
  return restaurants
    .filter((r) => !openOnly || isOpen(r))
    .map((r): FoundRestaurant => {
      if (!place || r.latitude == null || r.longitude == null) return { restaurant: r, distanceKm: null, delivers: null };
      const km = distanceKm(place, { lat: r.latitude, lng: r.longitude });
      return { restaurant: r, distanceKm: km, delivers: r.deliveryRadiusKm ? km <= r.deliveryRadiusKm : null };
    })
    .sort((a, b) =>
      place ? (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || byCityThenName(a, b) : byCityThenName(a, b),
    );
}

/** "800 m", "2,4 km", "112 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(100, Math.round(km * 10) * 100)} m`;
  return `${km.toLocaleString('fr-FR', { maximumFractionDigits: km < 10 ? 1 : 0 })} km`;
}
