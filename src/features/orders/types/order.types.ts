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
  delivery_address: string;
  items: OrderItem[];
  placed_at: string;
  confirmed_at?: string;
}

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
}
