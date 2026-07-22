import { http } from '../../../services/http';
import type { Supplier, SupplierForm } from '../types/supplier.types';

export const suppliersApi = {
  list: () => http<Supplier[]>('/api/franchise/suppliers'),

  create: (form: SupplierForm) =>
    http<Supplier>('/api/franchise/suppliers', { method: 'POST', body: JSON.stringify(form) }),

  remove: (id: string) => http<void>(`/api/franchise/suppliers/${id}`, { method: 'DELETE' }),
};
