import { supabase } from './supabase';
import { sendPushNotification } from './notifications';

export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  // Haversine formula to calculate distance between two points in miles
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) *
    Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function filterByRadius(
  broadcasts: any[],
  location: { lat: number; lng: number },
  radius: number
): any[] {
  return broadcasts.filter(broadcast => {
    const distance = calculateDistance(
      location,
      { lat: broadcast.lat, lng: broadcast.lng }
    );
    return distance <= radius;
  });
}

export function rankMatches(broadcasts: any[]): any[] {
  return [...broadcasts].sort((a, b) => {
    // Apply premium boost by moving premium broadcasts to the front
    if (a.isPremium !== b.isPremium) {
      return a.isPremium ? -1 : 1;
    }

    // First by distance (ascending)
    if (a.distance !== b.distance) {
      return a.distance - b.distance;
    }

    // Then by recency (descending)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getFilteredAndRankedBroadcasts(
  broadcasts: any[],
  location: { lat: number; lng: number },
  radius: number
): any[] {
  const filtered = filterByRadius(broadcasts, location, radius);
  return rankMatches(filtered);
}

export async function handleInterest(broadcastId: string, userId: string) {
  try {
    // Check if there's an existing chat room
    const { data: existingChat, error: chatError } = await supabase
      .from('chats')
      .select('id, creator_user_id, interested_user_id, is_unlocked')
      .eq('broadcast_id', broadcastId)
      .single();

    if (chatError && chatError.code !== 'PGRST116') {
      throw chatError;
    }

    // If no existing chat, create one
    if (!existingChat) {
      const { data: broadcast, error: broadcastError } = await supabase
        .from('broadcasts')
        .select('user_id, activity')
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

      // Send push notification to broadcast creator
      await sendPushNotification(
        broadcast.user_id,
        'New Interest',
        `Someone is interested in your "${broadcast.activity}" broadcast!`,
        { type: 'interest', broadcastId, chatId: newChat.id }
      );

      return { chatId: newChat.id, isUnlocked: false };
    }

    // If chat exists, check for mutual interest
    const isMutualInterest =
      (existingChat.creator_user_id === userId && existingChat.interested_user_id !== userId) ||
      (existingChat.interested_user_id === userId && existingChat.creator_user_id !== userId);

    if (isMutualInterest && !existingChat.is_unlocked) {
      // Unlock the chat if mutual interest
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
    console.error('Error checking for mutual interest:', error);
    throw error;
  }
}
