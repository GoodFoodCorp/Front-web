import { http } from '../../../services/http';
import type {
  AvailableDelivery,
  CourierOverview,
  CourierProfile,
  CourierProfileForm,
  Delivery,
  DeliveryDetail,
} from '../types/delivery.types';

export const deliveryApi = {
  listAvailable: () => http<AvailableDelivery[]>('/api/deliveries/available'),

  listMine: () => http<Delivery[]>('/api/deliveries/mine'),

  accept: (id: string) => http<Delivery>(`/api/deliveries/${id}/accept`, { method: 'POST' }),

  release: (id: string) => http<Delivery>(`/api/deliveries/${id}/release`, { method: 'POST' }),

  pickup: (id: string) => http<Delivery>(`/api/deliveries/${id}/pickup`, { method: 'POST' }),

  /** Requires the customer's handover code (proof of delivery). */
  dropoff: (id: string, code: string) =>
    http<Delivery>(`/api/deliveries/${id}/dropoff`, { method: 'POST', body: JSON.stringify({ code }) }),

  rate: (id: string, rating: number, comment: string) =>
    http<Delivery>(`/api/deliveries/${id}/rating`, { method: 'POST', body: JSON.stringify({ rating, comment }) }),

  /** Earnings, recent trips, balance and payouts of the connected courier. */
  overview: () => http<CourierOverview>('/api/deliveries/history'),

  profile: () => http<CourierProfile>('/api/courier-profile'),

  saveProfile: (form: CourierProfileForm) =>
    http<CourierProfile>('/api/courier-profile', { method: 'PUT', body: JSON.stringify(form) }),

  setAvailability: (isAvailable: boolean) =>
    http<CourierProfile>('/api/courier-profile/availability', { method: 'PATCH', body: JSON.stringify({ isAvailable }) }),

  /** Withdraws the whole available balance. */
  requestPayout: () => http<unknown>('/api/courier-profile/withdrawals', { method: 'POST' }),

  /** The service resolves either a delivery id or an order id. */
  getByOrderId: (orderId: string) => http<DeliveryDetail>(`/api/deliveries/${orderId}`),
};
