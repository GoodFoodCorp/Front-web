import { http } from '../../../services/http';
import type { AddressSuggestion, DeliveryQuote, OperationsForm, Restaurant } from '../types/restaurant.types';

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

  /** Opening hours, delivery zone and fees, preparation time, seats. */
  updateOperations: (id: string, form: OperationsForm) =>
    http<Restaurant>(`/api/restaurants/${id}/operations`, { method: 'PUT', body: JSON.stringify(form) }),

  /** Pauses or resumes new orders. */
  setOrderIntake: (id: string, acceptingOrders: boolean) =>
    http<Restaurant>(`/api/restaurants/${id}/order-intake`, { method: 'PUT', body: JSON.stringify({ acceptingOrders }) }),

  /** Street addresses matching what is typed; `near` (a restaurant)
   *  keeps the deliverable surroundings only. */
  suggestAddresses: (query: string, near?: { lat: number; lng: number }) =>
    http<AddressSuggestion[]>(
      `/api/restaurants/address-suggestions?q=${encodeURIComponent(query)}&limit=5` +
        (near ? `&lat=${near.lat}&lng=${near.lng}` : ''),
    ),

  /** Can the restaurant take an order for this address now ("" = pickup)? */
  quote: (id: string, address: string) =>
    http<DeliveryQuote>(`/api/restaurants/${id}/quote?address=${encodeURIComponent(address)}`),
};
