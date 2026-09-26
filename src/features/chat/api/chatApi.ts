import { http } from '../../../services/http';
import type { SendMessagePayload, SendMessageResponse } from '../types/chat.types';

/** The chat assistant is served by assistant-service. */
export const chatApi = {
  sendMessage: (payload: SendMessagePayload) =>
    http<SendMessageResponse>('/api/chat/messages', { method: 'POST', body: JSON.stringify(payload) }),
};
