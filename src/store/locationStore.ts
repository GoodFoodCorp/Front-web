import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Place } from '../features/restaurants/finder';

/**
 * What the storefront knows of where the customer orders from: the last
 * restaurant they opened (the homepage shows its menu) and the address or
 * position they searched from (restaurants sorted by distance). Both stay in
 * this browser only; nothing to do with a franchisee's tenant_id.
 */
interface LocationState {
  restaurantId: string | null;
  place: Place | null;
  setRestaurantId: (id: string) => void;
  setPlace: (place: Place | null) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      restaurantId: null,
      place: null,
      setRestaurantId: (id) => set({ restaurantId: id }),
      setPlace: (place) => set({ place }),
    }),
    { name: 'goodfood.location' },
  ),
);
