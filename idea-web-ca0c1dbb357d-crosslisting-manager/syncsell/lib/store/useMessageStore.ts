import { create } from 'zustand';
import { getMessages, markMessageAsRead, getPlatforms } from '../db';

interface Message {
  id: number;
  platformId: number;
  buyerName: string;
  content: string;
  read: number;
  receivedAt: string;
  platform?: string;
  timestamp?: string;
}

interface MessageStore {
  messages: Message[];
  loading: boolean;
  error: any;
  fetchMessages: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  
  fetchMessages: async () => {
    set({ loading: true, error: null });
    try {
      getMessages((fetchedMessages) => {
        getPlatforms((platforms) => {
          const messagesWithPlatform = fetchedMessages.map((msg) => {
            const platform = platforms.find((p) => p.id === msg.platformId);
            return {
              ...msg,
              platform: platform?.name || 'Unknown',
              timestamp: new Date(msg.receivedAt).toLocaleString(),
            };
          });
          set({ messages: messagesWithPlatform, loading: false });
        });
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  
  markAsRead: async (id: number) => {
    try {
      markMessageAsRead(id, () => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, read: 1 } : msg
          ),
        }));
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },
  
  refreshMessages: async () => {
    await get().fetchMessages();
  },
}));

export default useMessageStore;
