import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '../features/chat/types/chat.types';

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  toggle: () => void;
  close: () => void;
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      reset: () => set({ messages: [] }),
    }),
    { name: 'goodfood.chat' },
  ),
);
