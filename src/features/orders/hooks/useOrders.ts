import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import { ApiError } from '../../../services/http';
import { getStripe, stripeEnabled } from '../../../services/stripe';
import type { CheckoutRequest, Order, OrderStatus } from '../types/order.types';
import { BACKOFFICE_REFETCH_MS } from '../../../config/app.config';
import { useCartStore } from '../../../store/cartStore';

export function useMyOrders() {
  return useQuery({ queryKey: ['orders', 'mine'], queryFn: ordersApi.listMine });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
  });
}

export function useRestaurantOrders(restaurantId: string | null, statuses: OrderStatus[] = []) {
  return useQuery({
    queryKey: ['orders', 'restaurant', restaurantId, statuses],
    queryFn: () => ordersApi.listByRestaurant(restaurantId!, statuses),
    enabled: !!restaurantId,
    refetchInterval: BACKOFFICE_REFETCH_MS,
  });
}

/**
 * Full checkout flow: create order → payment intent (Stripe test) → confirm.
 * Kept in the hook so the checkout page stays presentational.
 */
/** The confirmation may arrive a moment before payment-service sees the
 *  charge (or after its webhook confirmed the order): a few spaced retries. */
async function confirmWhenPaid(orderId: string, attempts = 4): Promise<Order> {
  for (let i = 1; ; i++) {
    try {
      return await ordersApi.confirm(orderId);
    } catch (err) {
      if (i >= attempts || !(err instanceof ApiError) || err.status !== 502) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1500 * i));
    }
  }
}

/**
 * Places, pays and confirms an order. The amount is computed by the server;
 * with Stripe, the browser completes the payment (3-D Secure included) on
 * the intent created for the chosen saved card.
 */
export function useCheckout() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);

  return useMutation({
    mutationFn: async ({ order: payload, paymentMethodId, idempotencyKey }: CheckoutRequest) => {
      const order = await ordersApi.create(payload, idempotencyKey);
      const intent = await ordersApi.createPaymentIntent(order.id, paymentMethodId);
      if (stripeEnabled) {
        const stripe = await getStripe();
        if (!stripe || !intent.client_secret) throw new Error('Paiement indisponible pour le moment.');
        const result = await stripe.confirmCardPayment(intent.client_secret);
        if (result.error) throw new Error(result.error.message ?? 'Paiement refusé.');
      }
      return confirmWhenPaid(order.id);
    },
    onSuccess: () => {
      clearCart();
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}
