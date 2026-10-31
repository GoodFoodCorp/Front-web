import { describe, expect, it } from 'vitest';
import { citiesOf, distanceKm, findRestaurants, formatDistance, type FinderFilters } from './finder';
import type { Restaurant } from './types/restaurant.types';

const resto = (over: Partial<Restaurant>): Restaurant => ({
  id: over.name ?? 'r',
  name: 'R',
  slug: 'r',
  address: '1 rue X',
  city: 'Paris',
  plan: 'standard',
  isActive: true,
  ...over,
});

const ALL: FinderFilters = { text: '', city: '', openOnly: false, deliversOnly: false, sort: 'name' };
const PARIS = { label: 'Paris', lat: 48.8566, lng: 2.3522 };

const montparnasse = resto({ name: 'Montparnasse', address: '10 rue de Rennes 75006', latitude: 48.8442, longitude: 2.3245, deliveryRadiusKm: 5 });
const rouen = resto({ name: 'Rouen Centre', city: 'Rouen', address: '5 place du Vieux-Marché', latitude: 49.4431, longitude: 1.0993, deliveryRadiusKm: 5, isOpenNow: false });
const republique = resto({ name: 'République', address: '2 place de la République 75011' });

describe('findRestaurants', () => {
  const list = [rouen, republique, montparnasse];

  it('matches name, street and postal code, accents ignored', () => {
    expect(findRestaurants(list, { ...ALL, text: 'republique' }, null, () => undefined).map((f) => f.restaurant.name)).toEqual(['République']);
    expect(findRestaurants(list, { ...ALL, text: '75006' }, null, () => undefined)).toHaveLength(1);
    expect(findRestaurants(list, { ...ALL, text: 'vieux marche' }, null, () => undefined)).toHaveLength(1);
    expect(findRestaurants(list, { ...ALL, text: 'Vieux-Marché' }, null, () => undefined)).toHaveLength(1);
    expect(findRestaurants(list, { ...ALL, text: 'lyon' }, null, () => undefined)).toHaveLength(0);
  });

  it('filters by city and by opening', () => {
    expect(findRestaurants(list, { ...ALL, city: 'Rouen' }, null, () => undefined)).toHaveLength(1);
    expect(findRestaurants(list, { ...ALL, openOnly: true }, null, () => undefined).map((f) => f.restaurant.name)).not.toContain('Rouen Centre');
  });

  it('puts the closest first and the unlocated last', () => {
    const found = findRestaurants(list, { ...ALL, sort: 'distance' }, PARIS, () => undefined);
    expect(found.map((f) => f.restaurant.name)).toEqual(['Montparnasse', 'Rouen Centre', 'République']);
    expect(found[0].delivers).toBe(true);
    expect(found[1].delivers).toBe(false);
    expect(found[2].distanceKm).toBeNull();
  });

  it('keeps only the restaurants delivering the place', () => {
    expect(findRestaurants(list, { ...ALL, deliversOnly: true }, PARIS, () => undefined).map((f) => f.restaurant.name)).toEqual(['Montparnasse']);
  });

  it('sorts by rating without a place, even if distance was asked', () => {
    const marks: Record<string, number> = { 'Rouen Centre': 4.8, Montparnasse: 4.1 };
    expect(findRestaurants(list, { ...ALL, sort: 'distance' }, null, (id) => marks[id]).map((f) => f.restaurant.name)).toEqual([
      'Rouen Centre',
      'Montparnasse',
      'République',
    ]);
  });
});

describe('helpers', () => {
  it('measures distances', () => {
    expect(distanceKm(PARIS, { lat: 49.4431, lng: 1.0993 })).toBeGreaterThan(100);
    expect(distanceKm(PARIS, { lat: 49.4431, lng: 1.0993 })).toBeLessThan(120);
  });

  it('formats distances', () => {
    expect(formatDistance(0.42)).toBe('400 m');
    expect(formatDistance(2.43)).toBe('2,4 km');
    expect(formatDistance(112.3)).toBe('112 km');
  });

  it('lists cities, most restaurants first', () => {
    expect(citiesOf([rouen, republique, montparnasse])).toEqual([
      { city: 'Paris', count: 2 },
      { city: 'Rouen', count: 1 },
    ]);
  });
});
