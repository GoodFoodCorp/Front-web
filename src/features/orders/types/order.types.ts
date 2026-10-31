import type { StripeCardElement } from '@stripe/stripe-js';

export type OrderStatus =
  | 'PLACED'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'IN_PREPARATION'
  | 'READY_FOR_PICKUP'
  | 'IN_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price_cents: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  status: OrderStatus;
  total_amount_cents: number;
  discount_cents?: number;
  amount_due_cents: number;
  promo_code?: string;
  delivery_address: string;
  items: OrderItem[];
  placed_at: string;
  confirmed_at?: string;
  fulfillment: Fulfillment;
  delivery_fee_cents: number;
  tip_cents: number;
  estimated_minutes?: number;
  courier_id?: string;
  cancellation?: OrderCancellation;
}

/** Who cancelled the order, and why. */
export interface OrderCancellation {
  by: 'CUSTOMER' | 'RESTAURANT' | 'HEAD_OFFICE';
  reason: string;
  comment?: string;
  at?: string;
}

export type Fulfillment = 'DELIVERY' | 'PICKUP';

export interface PaymentIntent {
  intent_id: string;
  client_secret?: string;
  amount_cents: number;
  currency: string;
}

export interface CreateOrderItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price_cents: number;
  special_instructions?: string;
}

export interface CreateOrderPayload {
  restaurant_id: string;
  delivery_address: string;
  items: CreateOrderItem[];
  promo_code?: string;
  fulfillment: Fulfillment;
  tip_cents: number;
}

/** What the customer chose at checkout besides the order itself. */
export interface CheckoutRequest {
  order: CreateOrderPayload;
  /** One of the customer's saved cards… */
  paymentMethodId?: string;
  /** …or a card typed now (Stripe), kept afterwards if saveCard. */
  newCard?: StripeCardElement;
  saveCard?: boolean;
  /** Same key for every retry of one checkout: never two orders. */
  idempotencyKey: string;
}
