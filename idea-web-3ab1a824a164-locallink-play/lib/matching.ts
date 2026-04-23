import { supabase } from './supabase';
import { sendPushNotification } from './notifications';
import { useChatStore } from '../store/chatStore';

export async function handleInterest(broadcastId: string, userId: string) {
  try {
    // 1. Check if there's an existing chat room
    const { data: existingChat, error: chatError } = await supabase
      .from('chats')
      .select('id, creator_user_id, interested_user_id')
      .eq('broadcast_id', broadcastId)
      .single();

    if (chatError && chatError.code !== 'PGRST116') {
      throw chatError;
    }

    // 2. If no existing chat, create one
    if (!existingChat) {
      const { data: broadcast, error: broadcastError } = await supabase
        .from('broadcasts')
        .select('user_id')
        .eq('id', broadcastId)
        .single();

      if (broadcastError) throw broadcastError;

      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          broadcast_id: broadcastId,
          creator_user_id: broadcast.user_id,
          interested_user_id: userId,
          created_at: new Date().toISOString(),
          is_unlocked: false
        })
        .select()
        .single();

      if (createError) throw createError;

      // 3. Send push notification to broadcast creator
      await sendPushNotification(
        broadcast.user_id,
        'New Interest',
        `Someone is interested in your "${broadcast.activity}" broadcast!`,
        { type: 'interest', broadcastId, chatId: newChat.id }
      );

      return { chatId: newChat.id, isUnlocked: false };
    }

    // 4. If chat exists, check for mutual interest
    const isMutualInterest =
      (existingChat.creator_user_id === userId && existingChat.interested_user_id !== userId) ||
      (existingChat.interested_user_id === userId && existingChat.creator_user_id !== userId);

    if (isMutualInterest) {
      // 5. Unlock the chat if mutual interest
      const { error: unlockError } = await supabase
        .from('chats')
        .update({ is_unlocked: true })
        .eq('id', existingChat.id);

      if (unlockError) throw unlockError;

      // Notify both users
      const otherUserId = existingChat.creator_user_id === userId
        ? existingChat.interested_user_id
        : existingChat.creator_user_id;

      await sendPushNotification(
        otherUserId,
        'Chat Unlocked!',
        'Your chat has been unlocked - start messaging now!',
        { type: 'chat_unlocked', chatId: existingChat.id }
      );

      return { chatId: existingChat.id, isUnlocked: true };
    }

    return { chatId: existingChat.id, isUnlocked: existingChat.is_unlocked };
  } catch (error) {
    console.error('Error handling interest:', error);
    throw error;
  }
}

export async function checkForMutualInterest(chatId: string, userId: string) {
  try {
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('creator_user_id, interested_user_id, is_unlocked')
      .eq('id', chatId)
      .single();

    if (chatError) throw chatError;

    const isMutualInterest =
      (chat.creator_user_id === userId && chat.interested_user_id !== userId) ||
      (chat.interested_user_id === userId && chat.creator_user_id !== userId);

    if (isMutualInterest && !chat.is_unlocked) {
      const { error: unlockError } = await supabase
        .from('chats')
        .update({ is_unlocked: true })
        .eq('id', chatId);

      if (unlockError) throw unlockError;

      // Notify both users
      const otherUserId = chat.creator_user_id === userId
        ? chat.interested_user_id
        : chat.creator_user_id;

      await sendPushNotification(
        otherUserId,
        'Chat Unlocked!',
        'Your chat has been unlocked - start messaging now!',
        { type: 'chat_unlocked', chatId }
      );

      return true;
    }

    return chat.is_unlocked;
  } catch (error) {
    console.error('Error checking mutual interest:', error);
    throw error;
  }
}
