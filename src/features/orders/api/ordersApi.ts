import { http } from '../../../services/http';
import type { CreateOrderPayload, Order, OrderStatus, PaymentIntent } from '../types/order.types';

export const ordersApi = {
  create: (payload: CreateOrderPayload, idempotencyKey: string) =>
    http<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Idempotency-Key': idempotencyKey },
    }),

  get: (id: string) => http<Order>(`/api/orders/${id}`),

  listMine: (limit = 50, offset = 0) => http<Order[]>(`/api/orders?limit=${limit}&offset=${offset}`),

  /** Cancels with a reason: the customer until the kitchen starts, the
   *  restaurant until the courier has the order. */
  cancel: (id: string, reason: string, comment: string) =>
    http<Order>(`/api/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason, comment }) }),

  /** A restaurant's orders, newest first, optionally only in some statuses. */
  listByRestaurant: (restaurantId: string, statuses: OrderStatus[] = [], limit = 100, offset = 0) =>
    http<Order[]>(
      `/api/orders?restaurantId=${restaurantId}&limit=${limit}&offset=${offset}${statuses.length ? `&status=${statuses.join(',')}` : ''}`,
    ),

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
