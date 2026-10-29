export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'CANCELED';

export interface PaymentHistoryEntry {
  id: string;
  orderId: string;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  paidAt: string | null;
}

/** Raw shape returned by payment-service (snake_case). */
export interface PaymentHistoryEntryDto {
  id: string;
  order_id: string;
  status: PaymentStatus;
  amount_cents: number;
  currency: string;
  paid_at?: string;
}

export interface PaymentMethod {
  id: string;
  cardholderName: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentMethodDto {
  id: string;
  cardholder_name: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: string;
}

/** A card registered with Stripe: only its payment method id is sent. */
export interface AddPaymentMethodForm {
  payment_method_id: string;
  is_default: boolean;
}
