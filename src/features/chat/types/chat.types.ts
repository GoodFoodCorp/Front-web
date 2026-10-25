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
  items: ProposedItem[];
  delivery_address: string;
  total_amount_cents: number;
  payment_method?: string;
}

/** A restaurant the customer can pick with one click when the assistant asks
 *  which restaurant to order from (no restaurant page is open). */
export interface RestaurantChoice {
  id: string;
  name: string;
  city?: string;
}

export type ProposalStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  proposal?: OrderProposal;
  proposalStatus?: ProposalStatus;
  choices?: RestaurantChoice[];
  /** Written by the interface itself (order confirmed, error…), not by the
   *  assistant: shown to the customer but never sent back to the model, which
   *  would otherwise copy it. */
  ui?: boolean;
}

export interface SendMessagePayload {
  messages: { role: ChatRole; content: string }[];
  restaurant_id?: string;
}

export interface SendMessageResponse {
  role: 'assistant';
  content: string;
  proposal?: OrderProposal;
  choices?: RestaurantChoice[];
}
