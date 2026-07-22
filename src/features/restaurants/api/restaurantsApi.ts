import { http } from '../../../services/http';
import type { Restaurant } from '../types/restaurant.types';

/** Restaurants are served by franchise-service. */
export const restaurantsApi = {
  list: async (): Promise<Restaurant[]> => {
    const restaurants = await http<Restaurant[]>('/api/restaurants');
    return restaurants.filter((r) => r.isActive);
  },

  get: (id: string) => http<Restaurant>(`/api/restaurants/${id}`),
};
