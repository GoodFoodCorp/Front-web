import { http } from '../../../services/http';
import type { Delivery, DeliveryDetail } from '../types/delivery.types';

export const deliveryApi = {
  listAvailable: () => http<Delivery[]>('/api/deliveries/available'),

  listMine: () => http<Delivery[]>('/api/deliveries/mine'),

  accept: (id: string) => http<Delivery>(`/api/deliveries/${id}/accept`, { method: 'POST' }),

  pickup: (id: string) => http<Delivery>(`/api/deliveries/${id}/pickup`, { method: 'POST' }),

  dropoff: (id: string) => http<Delivery>(`/api/deliveries/${id}/dropoff`, { method: 'POST' }),

  /** The service resolves either a delivery id or an order id. */
  getByOrderId: (orderId: string) => http<DeliveryDetail>(`/api/deliveries/${orderId}`),
};
