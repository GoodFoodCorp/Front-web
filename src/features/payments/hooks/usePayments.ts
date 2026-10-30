import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { selectIsLoggedIn, useAuthStore } from '../../../store/authStore';
import { paymentsApi } from '../api/paymentsApi';
import type { AddPaymentMethodForm } from '../types/payment.types';

export function usePaymentHistory() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  return useQuery({ queryKey: ['payments', 'history'], queryFn: paymentsApi.history, enabled: isLoggedIn });
}

export function usePaymentMethods() {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  return useQuery({ queryKey: ['payments', 'methods'], queryFn: paymentsApi.listMethods, enabled: isLoggedIn });
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
