import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

/** analytics-service caches its own snapshots, so a short client staleTime
 *  is enough to avoid hammering it on every navigation. */
const STALE_TIME_MS = 60_000;

export function useNetworkAnalytics(days: number) {
  return useQuery({
    queryKey: ['analytics', 'network', days],
    queryFn: () => analyticsApi.network(days),
    staleTime: STALE_TIME_MS,
  });
}

export function useRestaurantAnalytics(days: number, restaurantId?: string) {
  return useQuery({
    queryKey: ['analytics', 'restaurant', days, restaurantId ?? 'mine'],
    queryFn: () => analyticsApi.restaurant(days, restaurantId),
    staleTime: STALE_TIME_MS,
  });
}
