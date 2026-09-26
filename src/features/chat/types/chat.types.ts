export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface SendMessagePayload {
  messages: ChatMessage[];
  restaurant_id?: string;
}

export interface SendMessageResponse {
  role: 'assistant';
  content: string;
}
