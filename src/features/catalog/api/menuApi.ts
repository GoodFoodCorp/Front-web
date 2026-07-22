import { http } from '../../../services/http';
import type { MenuItem, MenuItemDto, MenuItemForm } from '../types/menu.types';

function toMenuItem(d: MenuItemDto): MenuItem {
  return {
    id: d.id,
    restaurantId: d.restaurant_id,
    name: d.name,
    description: d.description,
    priceCents: d.price_cents,
    category: d.category,
    emoji: d.emoji,
    rating: d.rating,
    available: d.available,
  };
}

/** Menus are served by menu-service, scoped per restaurant (tenant). */
export const menuApi = {
  /** Public: a restaurant's available items (customer browsing). */
  byRestaurant: async (restaurantId: string): Promise<MenuItem[]> => {
    const dtos = await http<MenuItemDto[]>(`/api/menu?restaurantId=${restaurantId}`);
    return dtos.map(toMenuItem);
  },

  /** Manager: own restaurant's items, incl. unavailable. */
  listMine: async (): Promise<MenuItem[]> => {
    const dtos = await http<MenuItemDto[]>('/api/menu/manage');
    return dtos.map(toMenuItem);
  },

  create: async (form: MenuItemForm): Promise<MenuItem> =>
    toMenuItem(await http<MenuItemDto>('/api/menu', { method: 'POST', body: JSON.stringify(form) })),

  update: async (id: string, form: MenuItemForm): Promise<MenuItem> =>
    toMenuItem(await http<MenuItemDto>(`/api/menu/${id}`, { method: 'PATCH', body: JSON.stringify(form) })),

  remove: (id: string): Promise<void> => http(`/api/menu/${id}`, { method: 'DELETE' }),
};
