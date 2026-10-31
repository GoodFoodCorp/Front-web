import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Place } from '../features/restaurants/finder';

/**
 * Where the customer looks for restaurants from: the town, postal code,
 * address or position they picked (restaurants and dishes sorted by
 * distance). Stays in this browser only.
 */
interface LocationState {
  place: Place | null;
  setPlace: (place: Place | null) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      place: null,
      setPlace: (place) => set({ place }),
    }),
    { name: 'goodfood.location' },
  ),
);
