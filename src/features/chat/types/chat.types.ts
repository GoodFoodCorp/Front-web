export type ChatRole = 'user' | 'assistant';

/** One item of an OrderProposal — already resolved against the real menu by
 *  assistant-service, never invented by the model. */
export interface ProposedItem {
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price_cents: number;
}

/** A commande the assistant prepared from the conversation, awaiting the
 *  customer's explicit confirmation — never placed by assistant-service
 *  itself. */
export interface OrderProposal {
  restaurant_id: string;
  restaurant_name?: string;
  items: ProposedItem[];
  /** Checked with the restaurant: in its zone, open, above its minimum. */
  delivery_address: string;
  /** The dishes only. */
  total_amount_cents: number;
  delivery_fee_cents?: number;
  estimated_minutes?: number;
  payment_method?: string;
  /** No saved card: the customer pays in the cart. */
  needs_card?: boolean;
}

/** A real menu item the assistant talks about, shown as a card. */
export interface DishCard {
  id: string;
  restaurant_id: string;
  restaurant_name?: string;
  name: string;
  description?: string;
  category?: string;
  price_cents: number;
}

/** A restaurant the customer can pick with one click when the assistant asks
 *  which restaurant to order from (no restaurant page is open). */
export interface RestaurantChoice {
  id: string;
  name: string;
  city?: string;
}

/** in_cart: the customer took the proposal to the cart to finish there. */
export type ProposalStatus = 'pending' | 'confirmed' | 'cancelled' | 'in_cart';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  proposal?: OrderProposal;
  proposalStatus?: ProposalStatus;
  choices?: RestaurantChoice[];
  dishes?: DishCard[];
  /** assistant-service's signature of this reply: without it, the reply is
   *  not taken back as part of the conversation. */
  signature?: string;
  /** Written by the interface itself (order confirmed, error…), not by the
   *  assistant: shown to the customer but never sent back to the model, which
   *  would otherwise copy it. */
  ui?: boolean;
}

export interface HistoryMessage {
  role: ChatRole;
  content: string;
  signature?: string;
}

export interface SendMessagePayload {
  messages: HistoryMessage[];
  restaurant_id?: string;
}

export interface SendMessageResponse {
  role: 'assistant';
  content: string;
  proposal?: OrderProposal;
  choices?: RestaurantChoice[];
  dishes?: DishCard[];
  signature?: string;
}
