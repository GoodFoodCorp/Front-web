import { describe, expect, it } from 'vitest';
import { groupDishes } from './dishSearch';
import type { MenuItem } from './types/menu.types';
import type { Restaurant } from '../restaurants/types/restaurant.types';

const resto = (id: string, over: Partial<Restaurant> = {}): Restaurant => ({
  id,
  name: `Good Food ${id}`,
  slug: id,
  address: '1 rue X',
  city: 'Paris',
  plan: 'standard',
  isActive: true,
  ...over,
});

const dish = (id: string, name: string, restaurantId: string, priceCents = 1000): MenuItem => ({
  id,
  restaurantId,
  name,
  description: '',
  priceCents,
  category: 'Burgers',
  emoji: '',
  rating: 0,
  available: true,
  ingredients: [],
  allergens: [],
  isGlobal: restaurantId === '',
  hiddenForViewer: false,
  imageUrl: '',
});

const rouen = resto('Rouen', { latitude: 49.44, longitude: 1.09 });
const paris = resto('Paris', { latitude: 48.85, longitude: 2.35 });
const lille = resto('Lille', { isOpenNow: false });

describe('groupDishes', () => {
  it('one result per dish name, with every restaurant serving it', () => {
    const results = groupDishes(
      [
        { item: dish('1', 'Burger Deluxe', 'Rouen', 1299), hiddenIn: [] },
        { item: dish('2', 'burger deluxe', 'Paris', 1199), hiddenIn: [] },
        { item: dish('3', 'Burger Deluxe', 'Fermé', 999), hiddenIn: [] },
      ],
      [rouen, paris],
      null,
    );
    expect(results).toHaveLength(1);
    expect(results[0].offers.map((o) => [o.restaurant.id, o.item.priceCents])).toEqual([
      ['Paris', 1199],
      ['Rouen', 1299],
    ]);
    expect(results[0].fromCents).toBe(1199);
  });

  it('offers a global dish everywhere but where it is hidden', () => {
    const [result] = groupDishes([{ item: dish('g', 'Frites', ''), hiddenIn: ['Paris'] }], [rouen, paris, lille], null);
    expect(result.offers.map((o) => o.restaurant.id)).toEqual(['Rouen', 'Lille']);
  });

  it('puts open restaurants first, then the closest', () => {
    const [result] = groupDishes([{ item: dish('g', 'Frites', ''), hiddenIn: [] }], [lille, rouen, paris], {
      label: 'Rouen',
      lat: 49.44,
      lng: 1.09,
    });
    expect(result.offers.map((o) => o.restaurant.id)).toEqual(['Rouen', 'Paris', 'Lille']);
    expect(result.offers[0].distanceKm).toBeLessThan(1);
  });

  it('drops a dish no active restaurant serves', () => {
    expect(groupDishes([{ item: dish('1', 'Burger', 'Fermé'), hiddenIn: [] }], [rouen], null)).toEqual([]);
  });
});
