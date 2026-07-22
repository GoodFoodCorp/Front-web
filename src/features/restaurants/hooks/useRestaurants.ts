import { useQuery } from '@tanstack/react-query';
import { restaurantsApi } from '../api/restaurantsApi';

export function useRestaurants() {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: restaurantsApi.list,
    staleTime: 5 * 60 * 1000,
  });
}
