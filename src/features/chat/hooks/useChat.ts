import { useMutation } from '@tanstack/react-query';
import { useMatch } from 'react-router-dom';
import { chatApi } from '../api/chatApi';
import { useChatStore } from '../../../store/chatStore';
import { useCartStore } from '../../../store/cartStore';
import type { ChatMessage } from '../types/chat.types';

const FALLBACK_REPLY = "Désolé, une erreur est survenue en essayant de vous répondre. Réessayez dans un instant.";

/** What the model gets to see. The server is stateless, so the whole history is
 *  sent each time — but two kinds of turns are left out because the model copies
 *  what it sees instead of answering:
 *  - the interface's own messages ("Commande passée avec succès ! #…");
 *  - everything up to and including an order the customer already confirmed or
 *    cancelled: that order is over (assistant-service reads the customer's
 *    recent orders itself), and replaying its recap made the model re-announce
 *    it instead of answering the next question. */
export function historyForModel(messages: ChatMessage[]): { role: 'user' | 'assistant'; content: string }[] {
  let start = 0;
  messages.forEach((m, i) => {
    if (m.proposalStatus === 'confirmed' || m.proposalStatus === 'cancelled') start = i + 1;
  });
  return messages
    .slice(start)
    .filter((m) => !m.ui)
    .map(({ role, content }) => ({ role, content }));
}

/** Owns the send flow: appends the user's message, calls assistant-service
 *  with the full history (it is stateless), then appends the reply — along
 *  with an OrderProposal when the assistant prepared one, or restaurant
 *  choices when it needs to know where to order from. */
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
    mutationFn: (nextMessages: { role: 'user' | 'assistant'; content: string }[]) =>
      chatApi.sendMessage({ messages: nextMessages, restaurant_id: restaurantId ?? undefined }),
  });

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const nextMessages = [...historyForModel(messages), { role: 'user' as const, content: trimmed }];
    addMessage({ role: 'user', content: trimmed });
    mutation.mutate(nextMessages, {
      onSuccess: (reply) =>
        addMessage({
          role: 'assistant',
          content: reply.content,
          proposal: reply.proposal,
          proposalStatus: reply.proposal ? 'pending' : undefined,
          choices: reply.choices,
        }),
      onError: () => addMessage({ role: 'assistant', content: FALLBACK_REPLY, ui: true }),
    });
  };

  return { messages, sendMessage, isPending: mutation.isPending };
}
