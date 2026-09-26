import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promosApi } from '../api/promosApi';
import type { PromoCodeForm } from '../types/promo.types';

/** Head office: manage promo codes. */
export function usePromoCodes() {
  return useQuery({ queryKey: ['promos'], queryFn: promosApi.list });
}

export function useCreatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promosApi.create,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['promos'] }),
  });
}

export function useUpdatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: PromoCodeForm }) => promosApi.update(id, form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['promos'] }),
  });
}

export function useDeletePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: promosApi.remove,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['promos'] }),
  });
}

/** Customer: preview a code against the current cart total (no consumption). */
export function usePreviewPromoCode() {
  return useMutation({
    mutationFn: ({ code, amountCents }: { code: string; amountCents: number }) =>
      promosApi.preview(code, amountCents),
  });
}
