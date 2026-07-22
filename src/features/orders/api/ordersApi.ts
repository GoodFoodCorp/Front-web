import { http } from '../../../services/http';
import type { CreateOrderPayload, Order, PaymentIntent } from '../types/order.types';

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    http<Order>('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),

  get: (id: string) => http<Order>(`/api/orders/${id}`),

  listMine: () => http<Order[]>('/api/orders'),

  listByRestaurant: (restaurantId: string) =>
    http<Order[]>(`/api/orders?restaurantId=${restaurantId}`),

  createPaymentIntent: (id: string) =>
    http<PaymentIntent>(`/api/orders/${id}/payment-intent`, { method: 'POST' }),

  confirm: (id: string) => http<Order>(`/api/orders/${id}/confirm`, { method: 'POST' }),

  updateStatus: (id: string, status: string) =>
    http<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
