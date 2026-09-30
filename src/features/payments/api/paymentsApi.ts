import { http } from '../../../services/http';
import type {
  AddPaymentMethodForm,
  PaymentHistoryEntry,
  PaymentHistoryEntryDto,
  PaymentMethod,
  PaymentMethodDto,
} from '../types/payment.types';

function toHistoryEntry(d: PaymentHistoryEntryDto): PaymentHistoryEntry {
  return {
    id: d.id,
    orderId: d.order_id,
    status: d.status,
    amountCents: d.amount_cents,
    currency: d.currency,
    paidAt: d.paid_at ?? null,
  };
}

function toPaymentMethod(d: PaymentMethodDto): PaymentMethod {
  return {
    id: d.id,
    cardholderName: d.cardholder_name,
    brand: d.brand,
    last4: d.last4,
    expMonth: d.exp_month,
    expYear: d.exp_year,
    isDefault: d.is_default,
    createdAt: d.created_at,
  };
}

/** Payments and saved payment methods are owned by payment-service. */
export const paymentsApi = {
  history: async (): Promise<PaymentHistoryEntry[]> => {
    const dtos = await http<PaymentHistoryEntryDto[]>('/api/payments/me');
    return dtos.map(toHistoryEntry);
  },

  listMethods: async (): Promise<PaymentMethod[]> => {
    const dtos = await http<PaymentMethodDto[]>('/api/payments/methods');
    return dtos.map(toPaymentMethod);
  },

  addMethod: async (form: AddPaymentMethodForm): Promise<PaymentMethod> =>
    toPaymentMethod(
      await http<PaymentMethodDto>('/api/payments/methods', { method: 'POST', body: JSON.stringify(form) }),
    ),

  removeMethod: (id: string): Promise<void> => http(`/api/payments/methods/${id}`, { method: 'DELETE' }),
};
