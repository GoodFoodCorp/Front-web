import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../services/http';
import { REVIEWS_PAGE, reviewsApi, type ReviewSummary } from './reviewsApi';

export function useRestaurantReviews(restaurantId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['reviews', 'restaurant', restaurantId],
    queryFn: ({ pageParam }) => reviewsApi.ofRestaurant(restaurantId!, pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.items.length === REVIEWS_PAGE ? pages.length * REVIEWS_PAGE : undefined),
    enabled: !!restaurantId,
    staleTime: 60_000,
  });
}

/** Marks of the restaurants on screen, by restaurant id. */
export function useReviewSummaries(restaurantIds: string[]) {
  const ids = [...new Set(restaurantIds)].sort();
  return useQuery({
    queryKey: ['reviews', 'summaries', ids],
    queryFn: async () => {
      const marks = await reviewsApi.summaries(ids);
      return new Map<string, ReviewSummary>(marks.map((m) => [m.restaurant_id, m]));
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60_000,
  });
}

/** The order's review, null while there is none. */
export function useOrderReview(orderId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['reviews', 'order', orderId],
    queryFn: async () => {
      try {
        return await reviewsApi.ofOrder(orderId!);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!orderId && enabled,
  });
}

export function useReviewOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, rating, comment }: { orderId: string; rating: number; comment: string }) =>
      reviewsApi.create(orderId, rating, comment),
    onSuccess: (review, { orderId }) => {
      qc.setQueryData(['reviews', 'order', orderId], review);
      void qc.invalidateQueries({ queryKey: ['reviews', 'restaurant'] });
      void qc.invalidateQueries({ queryKey: ['reviews', 'summaries'] });
    },
  });
}

export function useRemoveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => reviewsApi.remove(orderId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}
