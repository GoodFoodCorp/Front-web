import { http } from '../../../services/http';
import type { HourAvailability, Reservation, ReservationForm, ReservationStatus } from '../types/reservation.types';

export const reservationsApi = {
  create: (form: ReservationForm) =>
    http<Reservation>('/api/reservations', { method: 'POST', body: JSON.stringify(form) }),

  /** Fully booked service hours for a restaurant on a given day. */
  availability: (restaurantId: string, date: string) =>
    http<HourAvailability[]>(`/api/reservations/availability?restaurantId=${restaurantId}&date=${date}`),

  listMine: () => http<Reservation[]>('/api/reservations/mine'),

  /** Manager: reservations of their own restaurant. */
  listForMyRestaurant: () => http<Reservation[]>('/api/reservations/restaurant'),

  updateStatus: (id: string, status: ReservationStatus) =>
    http<Reservation>(`/api/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  cancelMine: (id: string) =>
    http<Reservation>(`/api/reservations/${id}/cancel`, { method: 'PATCH' }),
};
