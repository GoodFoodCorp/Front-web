import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, ProposalStatus } from '../features/chat/types/chat.types';

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  /** Who the stored conversation belongs to (null: nobody is signed in). */
  ownerId: string | null;
  toggle: () => void;
  close: () => void;
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  setProposalStatus: (id: string, status: ProposalStatus) => void;
  reset: () => void;
  /** Wipes the conversation when the signed-in user is not the one it belongs to. */
  claimFor: (userId: string | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      ownerId: null,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      close: () => set({ isOpen: false }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, { ...message, id: crypto.randomUUID() }] })),
      setProposalStatus: (id, status) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, proposalStatus: status } : m)),
        })),
      reset: () => set({ messages: [] }),
      claimFor: (userId) =>
        set((state) => (state.ownerId === userId ? state : { ownerId: userId, messages: [], isOpen: false })),
    }),
    { name: 'goodfood.chat' },
  ),
);
