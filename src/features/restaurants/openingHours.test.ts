import { describe, expect, it } from 'vitest';
import { hoursOfDay, openingLabel } from './openingHours';
import type { Restaurant } from './types/restaurant.types';

const resto = (over: Partial<Restaurant>): Restaurant => ({
  id: 'r',
  name: 'R',
  slug: 'r',
  address: '',
  city: '',
  plan: 'free',
  isActive: true,
  ...over,
});

const SATURDAY = 6;

describe('openingLabel', () => {
  it('open until the end of the period', () => {
    expect(openingLabel(resto({ openState: 'OPEN', closesAt: '23:00' }))).toEqual({ open: true, badge: 'Ouvert', detail: 'jusqu’à 23 h 00' });
    expect(openingLabel(resto({ openState: 'OPEN', closesAt: '23:59' })).detail).toBe('jusqu’à minuit');
  });

  it('closed by the restaurant, whatever its hours', () => {
    expect(openingLabel(resto({ openState: 'CLOSED_BY_RESTAURANT', isOpenNow: false }))).toEqual({
      open: false,
      badge: 'Fermé',
      detail: 'fermé temporairement',
    });
  });

  it('words the next opening: today, tomorrow or a day of the week', () => {
    const next = (day: number) => openingLabel(resto({ openState: 'OUTSIDE_HOURS', nextOpeningDay: day, nextOpeningTime: '11:30' }), SATURDAY).detail;
    expect(next(SATURDAY)).toBe('ouvre à 11 h 30');
    expect(next(0)).toBe('ouvre demain à 11 h 30');
    expect(next(2)).toBe('ouvre mardi à 11 h 30');
  });

  it('without hours, never open', () => {
    expect(openingLabel(resto({ openState: 'NO_HOURS' })).open).toBe(false);
  });
});

describe('hoursOfDay', () => {
  it('lists the periods of a day, midnight and 24/7 included', () => {
    const slots = [
      { day: 1, opens: '19:00', closes: '23:59' },
      { day: 1, opens: '11:30', closes: '14:30' },
      { day: 2, opens: '00:00', closes: '23:59' },
    ];
    expect(hoursOfDay(slots, 1)).toBe('11 h 30 – 14 h 30 · 19 h 00 – minuit');
    expect(hoursOfDay(slots, 2)).toBe('24 h/24');
    expect(hoursOfDay(slots, 3)).toBe('');
  });
});
