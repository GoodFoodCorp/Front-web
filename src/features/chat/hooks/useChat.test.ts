// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { historyForModel } from './useChat';
import type { ChatMessage } from '../types/chat.types';

const msg = (m: Partial<ChatMessage>): ChatMessage => ({ id: crypto.randomUUID(), role: 'user', content: '', ...m });

describe('historyForModel', () => {
  it("sends the replies back with their signature, and never the interface's own messages", () => {
    const history = historyForModel([
      msg({ role: 'user', content: 'un burger ?' }),
      msg({ role: 'assistant', content: 'Le Burger Deluxe !', signature: 'sig-1' }),
      msg({ role: 'assistant', content: 'Commande passée avec succès !', ui: true }),
      msg({ role: 'user', content: 'merci' }),
    ]);
    expect(history).toEqual([
      { role: 'user', content: 'un burger ?' },
      { role: 'assistant', content: 'Le Burger Deluxe !', signature: 'sig-1' },
      { role: 'user', content: 'merci' },
    ]);
  });

  it('starts after a proposal that was confirmed, cancelled or moved to the cart', () => {
    const history = historyForModel([
      msg({ role: 'user', content: '2 burgers' }),
      msg({ role: 'assistant', content: 'Voici ce que je te propose', proposalStatus: 'in_cart' }),
      msg({ role: 'user', content: 'et un dessert ?' }),
    ]);
    expect(history).toEqual([{ role: 'user', content: 'et un dessert ?' }]);
  });
});
