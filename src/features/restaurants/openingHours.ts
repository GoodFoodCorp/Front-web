import type { OpeningSlot } from './types/restaurant.types';

/** "11:30 – 14:30 · 19:00 – 22:30" for the given day (0 = Sunday), "" if closed that day. */
export function hoursOfDay(slots: OpeningSlot[] | undefined, day: number): string {
  return (slots ?? [])
    .filter((s) => s.day === day)
    .sort((a, b) => a.opens.localeCompare(b.opens))
    .map((s) => (s.opens === '00:00' && s.closes >= '23:59' ? '24 h/24' : `${s.opens} – ${s.closes}`))
    .join(' · ');
}

export const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
