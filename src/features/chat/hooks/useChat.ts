import { useMutation } from '@tanstack/react-query';
import { useMatch } from 'react-router-dom';
import { chatApi } from '../api/chatApi';
import { useChatStore } from '../../../store/chatStore';
import { useCartStore } from '../../../store/cartStore';
import type { ChatMessage } from '../types/chat.types';

const FALLBACK_REPLY = "Désolé, une erreur est survenue en essayant de vous répondre. Réessayez dans un instant.";

/** Owns the send flow: appends the user's message, calls assistant-service
 *  with the full history (it is stateless), then appends the reply. */
export function useChat() {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const cartRestaurantId = useCartStore((s) => s.restaurantId);
  // Prefer the restaurant the customer is currently browsing (they may be
  // asking about its menu before adding anything to the cart); fall back to
  // the cart's restaurant elsewhere (e.g. while on the checkout page).
  const viewedRestaurant = useMatch('/restaurants/:id');
  const restaurantId = viewedRestaurant?.params.id ?? cartRestaurantId;

  const mutation = useMutation({
    mutationFn: (nextMessages: ChatMessage[]) =>
      chatApi.sendMessage({ messages: nextMessages, restaurant_id: restaurantId ?? undefined }),
  });

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];
    addMessage(userMessage);
    mutation.mutate(nextMessages, {
      onSuccess: (reply) => addMessage({ role: 'assistant', content: reply.content }),
      onError: () => addMessage({ role: 'assistant', content: FALLBACK_REPLY }),
    });
  };

  return { messages, sendMessage, isPending: mutation.isPending };
}
