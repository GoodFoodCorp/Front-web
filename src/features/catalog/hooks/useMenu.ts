import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryApi, menuApi, menuPlanApi } from '../api/menuApi';
import type { MenuItemForm, MenuPlanForm } from '../types/menu.types';

/** Customer: a restaurant's public menu (dishes). */
export function useRestaurantMenu(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => menuApi.byRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });
}

/** Franchisee: own restaurant's dishes · Admin: the global catalog. */
export function useMyMenu() {
  return useQuery({ queryKey: ['menu', 'mine'], queryFn: menuApi.listMine });
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: MenuItemForm) => menuApi.create(form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['menu'] }),
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: MenuItemForm }) => menuApi.update(id, form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['menu'] }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['menu'] }),
  });
}

export function useToggleMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuApi.toggleAvailability(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['menu'] }),
  });
}

/** Customer: a restaurant's public menus ("formules"). */
export function useRestaurantMenuPlans(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menu-plans', restaurantId],
    queryFn: () => menuPlanApi.byRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });
}

/** Franchisee: own restaurant's menus · Admin: the global catalog. */
export function useMyMenuPlans() {
  return useQuery({ queryKey: ['menu-plans', 'mine'], queryFn: menuPlanApi.listMine });
}

export function useCreateMenuPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: MenuPlanForm) => menuPlanApi.create(form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['menu-plans'] }),
  });
}

export function useUpdateMenuPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: MenuPlanForm }) => menuPlanApi.update(id, form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['menu-plans'] }),
  });
}

export function useDeleteMenuPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuPlanApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['menu-plans'] }),
  });
}

export function useToggleMenuPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => menuPlanApi.toggleAvailability(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['menu-plans'] }),
  });
}

/** Dish categories — public list, network-wide. */
export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: categoryApi.list, staleTime: 60 * 1000 });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => categoryApi.create(name),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}
