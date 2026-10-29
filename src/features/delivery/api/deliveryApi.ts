import { http } from '../../../services/http';
import type { AvailableDelivery, Delivery, DeliveryDetail } from '../types/delivery.types';

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

  /** The service resolves either a delivery id or an order id. */
  getByOrderId: (orderId: string) => http<DeliveryDetail>(`/api/deliveries/${orderId}`),
};
