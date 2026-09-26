import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/paymentsApi';
import type { AddPaymentMethodForm } from '../types/payment.types';

export function usePaymentHistory() {
  return useQuery({ queryKey: ['payments', 'history'], queryFn: paymentsApi.history });
}

export function usePaymentMethods() {
  return useQuery({ queryKey: ['payments', 'methods'], queryFn: paymentsApi.listMethods });
}

export function useAddPaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: AddPaymentMethodForm) => paymentsApi.addMethod(form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['payments', 'methods'] }),
  });
}

export function useRemovePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentsApi.removeMethod(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['payments', 'methods'] }),
  });
}
