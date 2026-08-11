import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * The "location" the storefront is currently browsing — i.e. which
 * restaurant's menu is shown on the homepage. Mirrors the location picker
 * in the Figma header. A customer can switch it at any time; it has no
 * relation to a franchisee's tenant_id.
 */
interface LocationState {
  restaurantId: string | null;
  setRestaurantId: (id: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      restaurantId: null,
      setRestaurantId: (id) => set({ restaurantId: id }),
    }),
    { name: 'goodfood.location' },
  ),
);
