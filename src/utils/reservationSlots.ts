import type { SlotGroup } from '../components/TimeSlotPicker';
import { todayISODate } from './date';

const SERVICE_HOURS = [
  { label: 'Déjeuner', start: '12:00', end: '14:00' },
  { label: 'Dîner', start: '19:00', end: '22:30' },
];
const STEP_MINUTES = 30;

function generateRange(startHM: string, endHM: string): string[] {
  const [startHour, startMinute] = startHM.split(':').map(Number);
  const [endHour, endMinute] = endHM.split(':').map(Number);
  const end = endHour * 60 + endMinute;

  const slots: string[] = [];
  for (let minutes = startHour * 60 + startMinute; minutes <= end; minutes += STEP_MINUTES) {
    slots.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return slots;
}

/** The restaurant's service hours for a given day, as time-slot groups —
 *  slots already past are hidden when booking for today. */
export function reservationSlotGroups(isoDate: string): SlotGroup[] {
  const isToday = isoDate === todayISODate();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return SERVICE_HOURS.map(({ label, start, end }) => ({
    label,
    slots: generateRange(start, end).filter((time) => {
      if (!isToday) return true;
      const [hour, minute] = time.split(':').map(Number);
      return hour * 60 + minute > nowMinutes;
    }),
  }));
}
