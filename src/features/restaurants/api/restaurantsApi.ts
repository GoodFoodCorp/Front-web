import { http } from '../../../services/http';
import type { Restaurant } from '../types/restaurant.types';

/** Restaurants are served by franchise-service. */
export const restaurantsApi = {
  list: async (): Promise<Restaurant[]> => {
    const restaurants = await http<Restaurant[]>('/api/restaurants');
    return restaurants.filter((r) => r.isActive);
  },

  /** Head office view: includes inactive restaurants too. */
  listAll: () => http<Restaurant[]>('/api/restaurants?includeInactive=true'),

  get: (id: string) => http<Restaurant>(`/api/restaurants/${id}`),

  create: (form: { name: string; slug: string; address: string; city: string; plan: string }) =>
    http<Restaurant>('/api/restaurants', { method: 'POST', body: JSON.stringify(form) }),

  update: (id: string, form: { name: string; address: string; city: string; isActive: boolean }) =>
    http<Restaurant>(`/api/restaurants/${id}`, { method: 'PATCH', body: JSON.stringify(form) }),
};
