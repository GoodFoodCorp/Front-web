import { http } from '../../../services/http';
import type { PromoCode, PromoCodeForm, PromoPreview } from '../types/promo.types';

/** Promo codes are served by promo-service. */
export const promosApi = {
  list: () => http<PromoCode[]>('/api/promos'),

  create: (form: PromoCodeForm) =>
    http<PromoCode>('/api/promos', { method: 'POST', body: JSON.stringify(form) }),

  update: (id: string, form: PromoCodeForm) =>
    http<PromoCode>(`/api/promos/${id}`, { method: 'PUT', body: JSON.stringify(form) }),

  remove: (id: string) => http<void>(`/api/promos/${id}`, { method: 'DELETE' }),

  /** Safe to call repeatedly while the customer is composing their cart. */
  preview: (code: string, amountCents: number) =>
    http<PromoPreview>(`/api/promos/preview?code=${encodeURIComponent(code)}&amountCents=${amountCents}`),
};
