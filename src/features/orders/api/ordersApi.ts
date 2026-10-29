import { http } from '../../../services/http';
import type { CreateOrderPayload, Order, PaymentIntent } from '../types/order.types';

export const ordersApi = {
  create: (payload: CreateOrderPayload, idempotencyKey: string) =>
    http<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Idempotency-Key': idempotencyKey },
    }),

  get: (id: string) => http<Order>(`/api/orders/${id}`),

  listMine: () => http<Order[]>('/api/orders'),

  /** The customer cancels their order (before the kitchen starts). */
  cancel: (id: string) => http<Order>(`/api/orders/${id}/cancel`, { method: 'POST' }),

  listByRestaurant: (restaurantId: string) =>
    http<Order[]>(`/api/orders?restaurantId=${restaurantId}`),

  createPaymentIntent: (id: string, paymentMethodId?: string) =>
    http<PaymentIntent>(`/api/orders/${id}/payment-intent`, {
      method: 'POST',
      body: JSON.stringify({ payment_method_id: paymentMethodId ?? '' }),
    }),

  confirm: (id: string) => http<Order>(`/api/orders/${id}/confirm`, { method: 'POST' }),

  updateStatus: (id: string, status: string) =>
    http<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
