import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, ProposalStatus } from '../features/chat/types/chat.types';

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  toggle: () => void;
  close: () => void;
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  setProposalStatus: (id: string, status: ProposalStatus) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, { ...message, id: crypto.randomUUID() }] })),
      setProposalStatus: (id, status) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, proposalStatus: status } : m)),
        })),
      reset: () => set({ messages: [] }),
    }),
    { name: 'goodfood.chat' },
  ),
);
