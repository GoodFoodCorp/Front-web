import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import type { CreateOrderPayload } from '../types/order.types';
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

export function useRestaurantOrders(restaurantId: string | null) {
  return useQuery({
    queryKey: ['orders', 'restaurant', restaurantId],
    queryFn: () => ordersApi.listByRestaurant(restaurantId!),
    enabled: !!restaurantId,
    refetchInterval: BACKOFFICE_REFETCH_MS,
  });
}

/**
 * Full checkout flow: create order → payment intent (Stripe test) → confirm.
 * Kept in the hook so the checkout page stays presentational.
 */
export function useCheckout() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clear);

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const order = await ordersApi.create(payload);
      await ordersApi.createPaymentIntent(order.id);
      return ordersApi.confirm(order.id);
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
