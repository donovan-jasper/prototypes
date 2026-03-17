import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChatListItem {
  id: string;
  broadcastId: string;
  otherUserId: string;
  otherUserName: string;
  activity: string;
  lastMessage?: string;
  unreadCount: number;
  createdAt: string;
}

interface ChatStore {
  chats: ChatListItem[];
  messages: Message[];
  loading: boolean;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  subscribeToChats: () => () => void;
  subscribeToMessages: (chatId: string) => () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  messages: [],
  loading: false,

  fetchChats: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });

    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          id,
          broadcast_id,
          creator_user_id,
          interested_user_id,
          created_at,
          broadcasts!inner(activity),
          creator:profiles!chats_creator_user_id_fkey(name),
          interested:profiles!chats_interested_user_id_fkey(name)
        `)
        .or(`creator_user_id.eq.${user.id},interested_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (chatsError) throw chatsError;

      const chatIds = (chatsData || []).map((chat) => chat.id);
      
      const { data: messagesData } = await supabase
        .from('messages')
        .select('chat_id, content, created_at')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: false });

      const lastMessages = new Map<string, string>();
      messagesData?.forEach((msg) => {
        if (!lastMessages.has(msg.chat_id)) {
          lastMessages.set(msg.chat_id, msg.content);
        }
      });

      const { data: unreadData } = await supabase
        .from('messages')
        .select('chat_id, sender_id')
        .in('chat_id', chatIds)
        .neq('sender_id', user.id)
        .eq('read', false);

      const unreadCounts = new Map<string, number>();
      unreadData?.forEach((msg) => {
        unreadCounts.set(msg.chat_id, (unreadCounts.get(msg.chat_id) || 0) + 1);
      });

      const chats: ChatListItem[] = (chatsData || []).map((chat) => {
        const isCreator = chat.creator_user_id === user.id;
        const otherUserId = isCreator ? chat.interested_user_id : chat.creator_user_id;
        const otherUserName = isCreator ? chat.interested.name : chat.creator.name;

        return {
          id: chat.id,
          broadcastId: chat.broadcast_id,
          otherUserId,
          otherUserName,
          activity: chat.broadcasts.activity,
          lastMessage: lastMessages.get(chat.id),
          unreadCount: unreadCounts.get(chat.id) || 0,
          createdAt: chat.created_at,
        };
      });

      set({ chats, loading: false });
    } catch (error) {
      console.error('Error fetching chats:', error);
      set({ loading: false });
    }
  },

  fetchMessages: async (chatId: string) => {
    set({ loading: true });

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, chat_id, sender_id, content, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const messages: Message[] = (data || []).map((msg) => ({
        id: msg.id,
        chatId: msg.chat_id,
        senderId: msg.sender_id,
        content: msg.content,
        createdAt: msg.created_at,
      }));

      set({ messages, loading: false });

      const user = useAuthStore.getState().user;
      if (user) {
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('chat_id', chatId)
          .neq('sender_id', user.id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ loading: false });
    }
  },

  sendMessage: async (chatId: string, content: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { error } = await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: user.id,
        content,
        created_at: new Date().toISOString(),
        read: false,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToChats: () => {
    const user = useAuthStore.getState().user;
    if (!user) return () => {};

    const subscription = supabase
      .channel('chats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `creator_user_id=eq.${user.id},interested_user_id=eq.${user.id}`,
        },
        () => {
          get().fetchChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  subscribeToMessages: (chatId: string) => {
    const subscription = supabase
      .channel(`messages_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            chatId: payload.new.chat_id,
            senderId: payload.new.sender_id,
            content: payload.new.content,
            createdAt: payload.new.created_at,
          };

          set((state) => ({
            messages: [newMessage, ...state.messages],
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
}));
