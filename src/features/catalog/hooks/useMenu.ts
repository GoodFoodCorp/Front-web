import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '../api/menuApi';
import type { MenuItemForm } from '../types/menu.types';

/** Customer: a restaurant's public menu. */
export function useRestaurantMenu(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => menuApi.byRestaurant(restaurantId!),
    enabled: !!restaurantId,
  });
}

/** Franchisee: own restaurant's menu (incl. unavailable items). */
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
