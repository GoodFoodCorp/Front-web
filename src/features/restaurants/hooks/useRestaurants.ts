import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantsApi } from '../api/restaurantsApi';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: restaurantsApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

/** Head office: every restaurant, active or not. */
export function useAllRestaurants() {
  return useQuery({
    queryKey: ['restaurants', 'all'],
    queryFn: restaurantsApi.listAll,
    staleTime: 60 * 1000,
  });
}

export function useCreateRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: restaurantsApi.create,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['restaurants'] }),
  });
}

export function useUpdateRestaurant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: { name: string; address: string; city: string; isActive: boolean } }) =>
      restaurantsApi.update(id, form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['restaurants'] }),
  });
}

/** Live quote for the cart: open now? in zone? which fee and delay? */
export function useDeliveryQuote(restaurantId: string | null, address: string, enabled: boolean) {
  return useQuery({
    queryKey: ['restaurants', restaurantId, 'quote', address],
    queryFn: () => restaurantsApi.quote(restaurantId as string, address),
    enabled: enabled && !!restaurantId,
    staleTime: 30 * 1000,
  });
}

export function useUpdateOperations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: Parameters<typeof restaurantsApi.updateOperations>[1] }) =>
      restaurantsApi.updateOperations(id, form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['restaurants'] }),
  });
}

export function useSetOrderIntake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, acceptingOrders }: { id: string; acceptingOrders: boolean }) =>
      restaurantsApi.setOrderIntake(id, acceptingOrders),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['restaurants'] }),
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ['restaurants', id],
    queryFn: () => restaurantsApi.get(id as string),
    enabled: !!id,
  });
}
