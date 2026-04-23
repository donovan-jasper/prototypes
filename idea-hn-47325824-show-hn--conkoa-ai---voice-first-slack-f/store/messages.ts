import { create } from 'zustand';
import { Message } from '../types'; // Import Message type

interface MessageStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void; // New action
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [message, ...state.messages]
  })),
  setMessages: (messages) => set({ messages }),
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === id ? { ...msg, ...updates } : msg
    ),
  })),
}));
