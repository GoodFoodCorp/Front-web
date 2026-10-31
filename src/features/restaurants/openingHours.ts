import type { OpeningSlot, Restaurant } from './types/restaurant.types';

export const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
/** Monday first, as French schedules read. */
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** "11 h 30", "9 h 00", "0 h 00"; "23:59" closes the day: shown as midnight. */
function time(hhmm: string): string {
  if (hhmm === '23:59') return 'minuit';
  const [h, m] = hhmm.split(':');
  return `${Number(h)} h ${m}`;
}

/** "11 h 30 – 14 h 30 · 19 h 00 – 22 h 30" for the given day (0 = Sunday), "" if closed that day. */
export function hoursOfDay(slots: OpeningSlot[] | undefined, day: number): string {
  return (slots ?? [])
    .filter((s) => s.day === day)
    .sort((a, b) => a.opens.localeCompare(b.opens))
    .map((s) => (s.opens === '00:00' && s.closes >= '23:59' ? '24 h/24' : `${time(s.opens)} – ${time(s.closes)}`))
    .join(' · ');
}

/** What customers and the restaurant read about its opening, right now. */
export interface OpeningLabel {
  open: boolean;
  /** "Ouvert", "Fermé". */
  badge: string;
  /** "jusqu'à 23 h 00", "ouvre demain à 11 h 00", "fermé temporairement"… */
  detail: string;
}

/**
 * The opening status as computed by franchise-service (in the restaurant's
 * time zone): one source for the badge, the detail and whether ordering is
 * possible. `today` (0 = Sunday) words the next opening.
 */
export function openingLabel(r: Restaurant, today = new Date().getDay()): OpeningLabel {
  switch (r.openState) {
    case 'OPEN':
      return { open: true, badge: 'Ouvert', detail: r.closesAt ? `jusqu’à ${time(r.closesAt)}` : '' };
    case 'CLOSED_BY_RESTAURANT':
      return { open: false, badge: 'Fermé', detail: 'fermé temporairement' };
    case 'NO_HOURS':
      return { open: false, badge: 'Fermé', detail: 'horaires pas encore communiqués' };
    case 'INACTIVE':
      return { open: false, badge: 'Fermé', detail: 'ne prend plus de commandes' };
    case 'OUTSIDE_HOURS': {
      if (r.nextOpeningDay == null || !r.nextOpeningTime) return { open: false, badge: 'Fermé', detail: '' };
      const when =
        r.nextOpeningDay === today
          ? ''
          : r.nextOpeningDay === (today + 1) % 7
            ? 'demain '
            : `${DAY_NAMES[r.nextOpeningDay].toLowerCase()} `;
      return { open: false, badge: 'Fermé', detail: `ouvre ${when}à ${time(r.nextOpeningTime)}` };
    }
    default: {
      const open = r.isOpenNow !== false && r.acceptingOrders !== false;
      return { open, badge: open ? 'Ouvert' : 'Fermé', detail: '' };
    }
  }
}
