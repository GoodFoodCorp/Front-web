import { describe, expect, it } from 'vitest';
import { distanceKm, formatDistance, listRestaurants, matchRestaurants, relevantPlaces } from './finder';
import type { AddressSuggestion, Restaurant } from './types/restaurant.types';

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

const PARIS = { label: 'Paris', lat: 48.8566, lng: 2.3522 };

const montparnasse = resto({ name: 'Montparnasse', address: '5 rue du Départ', latitude: 48.8442, longitude: 2.3245, deliveryRadiusKm: 5 });
const rouen = resto({ name: 'Rouen Centre', city: 'Rouen', address: '5 place du Vieux-Marché', latitude: 49.4431, longitude: 1.0993, deliveryRadiusKm: 5, isOpenNow: false });
const republique = resto({ name: 'République', address: '2 place de la République' });
const list = [rouen, republique, montparnasse];

const place = (label: string): AddressSuggestion => ({
  label,
  street: '',
  postalCode: '',
  city: '',
  country: 'France',
  countryCode: 'FR',
  latitude: 0,
  longitude: 0,
});

describe('matchRestaurants', () => {
  it('matches name, street and city, accents and dashes ignored', () => {
    expect(matchRestaurants(list, 'republique').map((r) => r.name)).toEqual(['République']);
    expect(matchRestaurants(list, 'vieux marche')).toHaveLength(1);
    expect(matchRestaurants(list, 'ROUEN')).toHaveLength(1);
    expect(matchRestaurants(list, 'lyon')).toHaveLength(0);
    expect(matchRestaurants(list, '  ')).toHaveLength(0);
  });
});

describe('listRestaurants', () => {
  it('lists by city then name without a place', () => {
    expect(listRestaurants(list, null, false).map((f) => f.restaurant.name)).toEqual(['Montparnasse', 'République', 'Rouen Centre']);
  });

  it('puts the closest first, tells who delivers, the unlocated last', () => {
    const found = listRestaurants(list, PARIS, false);
    expect(found.map((f) => f.restaurant.name)).toEqual(['Montparnasse', 'Rouen Centre', 'République']);
    expect(found[0].delivers).toBe(true);
    expect(found[1].delivers).toBe(false);
    expect(found[2].distanceKm).toBeNull();
  });

  it('keeps the open ones only when asked', () => {
    expect(listRestaurants(list, null, true).map((f) => f.restaurant.name)).not.toContain('Rouen Centre');
  });
});

describe('relevantPlaces', () => {
  it('drops the loose matches of the geocoder', () => {
    const found = [place('Rouen, France'), place('Place Paul Bert, 21000 Dijon, France'), place('Place Bernard Tissot, 76000 Rouen, France')];
    expect(relevantPlaces(found, 'rouen').map((p) => p.label)).toEqual(['Rouen, France', 'Place Bernard Tissot, 76000 Rouen, France']);
  });

  it('puts the namesakes far from every restaurant last', () => {
    const bulgaria = { ...place('Rouen, Bulgarie'), latitude: 43.1, longitude: 26.9 };
    const normandy = { ...place('Rouen, France'), latitude: 49.44, longitude: 1.09 };
    expect(relevantPlaces([bulgaria, normandy], 'rouen', list).map((p) => p.label)).toEqual(['Rouen, France', 'Rouen, Bulgarie']);
  });

  it('keeps everything rather than nothing (typos)', () => {
    expect(relevantPlaces([place('Rue de Rennes, 75006 Paris, France')], 'rue de renes')).toHaveLength(1);
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
});
