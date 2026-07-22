import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { suppliersApi } from '../api/suppliersApi';
import type { SupplierForm } from '../types/supplier.types';

export function useSuppliers() {
  return useQuery({ queryKey: ['suppliers'], queryFn: suppliersApi.list });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: SupplierForm) => suppliersApi.create(form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });
}
