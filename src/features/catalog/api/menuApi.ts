import { http } from '../../../services/http';
import type {
  Category,
  MenuItem,
  MenuItemDto,
  MenuItemForm,
  MenuPlan,
  MenuPlanDto,
  MenuPlanForm,
} from '../types/menu.types';

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
    ingredients: d.ingredients ?? [],
    isGlobal: d.is_global,
    hiddenForViewer: d.hidden_for_viewer,
    imageUrl: d.image_data_url ?? '',
  };
}

function toMenuPlan(d: MenuPlanDto): MenuPlan {
  return {
    id: d.id,
    restaurantId: d.restaurant_id,
    name: d.name,
    description: d.description,
    priceCents: d.price_cents,
    emoji: d.emoji,
    available: d.available,
    dishIds: d.dish_ids ?? [],
    isGlobal: d.is_global,
    hiddenForViewer: d.hidden_for_viewer,
    imageUrl: d.image_data_url ?? '',
  };
}

/** Dishes ("plats") are served by menu-service, scoped per restaurant —
 *  or global (common to every restaurant) when created by head office. */
export const menuApi = {
  /** Public: a restaurant's available dishes, merged with the global catalog. */
  byRestaurant: async (restaurantId: string): Promise<MenuItem[]> => {
    const dtos = await http<MenuItemDto[]>(`/api/menu?restaurantId=${restaurantId}`);
    return dtos.map(toMenuItem);
  },

  /** Manager: own restaurant's dishes · Admin: the global catalog. Incl. unavailable. */
  listMine: async (): Promise<MenuItem[]> => {
    const dtos = await http<MenuItemDto[]>('/api/menu/manage');
    return dtos.map(toMenuItem);
  },

  create: async (form: MenuItemForm): Promise<MenuItem> =>
    toMenuItem(await http<MenuItemDto>('/api/menu', { method: 'POST', body: JSON.stringify(form) })),

  update: async (id: string, form: MenuItemForm): Promise<MenuItem> =>
    toMenuItem(await http<MenuItemDto>(`/api/menu/${id}`, { method: 'PATCH', body: JSON.stringify(form) })),

  remove: (id: string): Promise<void> => http(`/api/menu/${id}`, { method: 'DELETE' }),

  /** Hide/show — own dish flips its real availability; a global dish, seen
   *  by a franchisee, toggles a per-restaurant override instead. */
  toggleAvailability: async (id: string): Promise<MenuItem> =>
    toMenuItem(await http<MenuItemDto>(`/api/menu/${id}/toggle`, { method: 'PATCH' })),
};

/** Menus ("formules" — bundles of dishes), same scoping rules as dishes. */
export const menuPlanApi = {
  byRestaurant: async (restaurantId: string): Promise<MenuPlan[]> => {
    const dtos = await http<MenuPlanDto[]>(`/api/menu-plans?restaurantId=${restaurantId}`);
    return dtos.map(toMenuPlan);
  },

  listMine: async (): Promise<MenuPlan[]> => {
    const dtos = await http<MenuPlanDto[]>('/api/menu-plans/manage');
    return dtos.map(toMenuPlan);
  },

  create: async (form: MenuPlanForm): Promise<MenuPlan> =>
    toMenuPlan(await http<MenuPlanDto>('/api/menu-plans', { method: 'POST', body: JSON.stringify(form) })),

  update: async (id: string, form: MenuPlanForm): Promise<MenuPlan> =>
    toMenuPlan(
      await http<MenuPlanDto>(`/api/menu-plans/${id}`, { method: 'PATCH', body: JSON.stringify(form) }),
    ),

  remove: (id: string): Promise<void> => http(`/api/menu-plans/${id}`, { method: 'DELETE' }),

  toggleAvailability: async (id: string): Promise<MenuPlan> =>
    toMenuPlan(await http<MenuPlanDto>(`/api/menu-plans/${id}/toggle`, { method: 'PATCH' })),
};

/** Dish categories — network-wide, managed by head office. */
export const categoryApi = {
  list: () => http<Category[]>('/api/menu-categories'),

  create: (name: string) =>
    http<Category>('/api/menu-categories', { method: 'POST', body: JSON.stringify({ name }) }),

  remove: (id: string): Promise<void> => http(`/api/menu-categories/${id}`, { method: 'DELETE' }),
};
