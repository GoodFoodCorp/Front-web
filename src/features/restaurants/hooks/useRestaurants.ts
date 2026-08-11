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
