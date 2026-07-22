import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stockApi } from '../api/stockApi';
import type { CreateStockPayload, MovementPayload } from '../types/stock.types';

export function useStocks() {
  return useQuery({ queryKey: ['stocks'], queryFn: stockApi.list });
}

export function useReplenishments() {
  return useQuery({ queryKey: ['replenishments'], queryFn: stockApi.listReplenishments });
}

export function useCreateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStockPayload) => stockApi.create(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['stocks'] }),
  });
}

/** A movement can auto-generate a replenishment, so both lists are refreshed. */
export function useRegisterMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MovementPayload }) =>
      stockApi.registerMovement(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stocks'] });
      void queryClient.invalidateQueries({ queryKey: ['replenishments'] });
    },
  });
}

export function useCreateReplenishment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stockItemId, quantity }: { stockItemId: string; quantity: number }) =>
      stockApi.createReplenishment(stockItemId, quantity),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['replenishments'] }),
  });
}

export function useUpdateReplenishmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      stockApi.updateReplenishmentStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['replenishments'] });
      void queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
  });
}
