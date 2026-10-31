import { http } from '../../services/http';

/** A verified review: left by the customer of a received order, shown without their name. */
export interface Review {
  id: string;
  rating: number;
  comment: string;
  ordered_at: string;
  created_at: string;
}

/** A restaurant's mark; restaurants without reviews have none. */
export interface ReviewSummary {
  restaurant_id: string;
  count: number;
  average: number;
  /** Reviews of 1 to 5 stars. */
  stars: [number, number, number, number, number];
}

export interface RestaurantReviews extends ReviewSummary {
  items: Review[];
}

export const REVIEWS_PAGE = 10;

export const reviewsApi = {
  ofRestaurant: (restaurantId: string, offset = 0) =>
    http<RestaurantReviews>(`/api/reviews?restaurantId=${restaurantId}&limit=${REVIEWS_PAGE}&offset=${offset}`),
  summaries: (restaurantIds: string[]) =>
    http<ReviewSummary[]>(`/api/reviews/summary?restaurantIds=${restaurantIds.join(',')}`),
  ofOrder: (orderId: string) => http<Review | undefined>(`/api/orders/${orderId}/review`),
  create: (orderId: string, rating: number, comment: string) =>
    http<Review>(`/api/orders/${orderId}/review`, { method: 'POST', body: JSON.stringify({ rating, comment }) }),
  remove: (orderId: string) => http<void>(`/api/reviews/${orderId}`, { method: 'DELETE' }),
};
