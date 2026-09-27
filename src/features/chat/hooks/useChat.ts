import { useMutation } from '@tanstack/react-query';
import { useMatch } from 'react-router-dom';
import { chatApi } from '../api/chatApi';
import { useChatStore } from '../../../store/chatStore';
import { useCartStore } from '../../../store/cartStore';

const FALLBACK_REPLY = "Désolé, une erreur est survenue en essayant de vous répondre. Réessayez dans un instant.";

/** Owns the send flow: appends the user's message, calls assistant-service
 *  with the full history (it is stateless), then appends the reply — along
 *  with an OrderProposal when the assistant prepared one. */
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
    const nextMessages = [...messages, { role: 'user' as const, content: trimmed }].map(
      ({ role, content }) => ({ role, content }),
    );
    addMessage({ role: 'user', content: trimmed });
    mutation.mutate(nextMessages, {
      onSuccess: (reply) =>
        addMessage({
          role: 'assistant',
          content: reply.content,
          proposal: reply.proposal,
          proposalStatus: reply.proposal ? 'pending' : undefined,
        }),
      onError: () => addMessage({ role: 'assistant', content: FALLBACK_REPLY }),
    });
  };

  return { messages, sendMessage, isPending: mutation.isPending };
}
