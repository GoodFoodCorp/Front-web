import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '../features/catalog/types/menu.types';

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

interface CartState {
  /** The restaurant the current cart belongs to (Uber-Eats rule: one cart = one restaurant). */
  restaurantId: string | null;
  restaurantName: string | null;
  lines: CartLine[];
  add: (item: MenuItem, restaurant: { id: string; name: string }) => void;
  decrement: (itemId: string) => void;
  remove: (itemId: string) => void;
  clear: () => void;
  totalCents: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      lines: [],

      add: (item, restaurant) =>
        set((state) => {
          // Switching restaurant starts a fresh cart.
          if (state.restaurantId && state.restaurantId !== restaurant.id) {
            return {
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              lines: [{ item, quantity: 1 }],
            };
          }
          const existing = state.lines.find((l) => l.item.id === item.id);
          const lines = existing
            ? state.lines.map((l) => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l))
            : [...state.lines, { item, quantity: 1 }];
          return { restaurantId: restaurant.id, restaurantName: restaurant.name, lines };
        }),

      decrement: (itemId) =>
        set((state) => {
          const lines = state.lines
            .map((l) => (l.item.id === itemId ? { ...l, quantity: l.quantity - 1 } : l))
            .filter((l) => l.quantity > 0);
          return lines.length === 0
            ? { lines, restaurantId: null, restaurantName: null }
            : { lines };
        }),

      remove: (itemId) =>
        set((state) => {
          const lines = state.lines.filter((l) => l.item.id !== itemId);
          return lines.length === 0
            ? { lines, restaurantId: null, restaurantName: null }
            : { lines };
        }),

      clear: () => set({ lines: [], restaurantId: null, restaurantName: null }),

      totalCents: () => get().lines.reduce((sum, l) => sum + l.item.priceCents * l.quantity, 0),

      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: 'goodfood.cart' },
  ),
);
