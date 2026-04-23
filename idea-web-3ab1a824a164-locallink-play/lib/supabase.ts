import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Fetches broadcasts within the specified radius of the user's location
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @param radius Search radius in miles
 * @returns Array of broadcasts with distance information
 */
export async function fetchNearbyBroadcasts(latitude: number, longitude: number, radius: number) {
  try {
    const { data, error } = await supabase
      .rpc('get_nearby_broadcasts', {
        user_lat: latitude,
        user_lng: longitude,
        search_radius: radius
      });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching nearby broadcasts:', error);
    throw error;
  }
}

/**
 * Expresses interest in a broadcast and handles mutual interest logic
 * @param broadcastId ID of the broadcast
 * @param userId ID of the user expressing interest
 * @returns Object with chat ID and whether chat is unlocked
 */
export async function expressInterest(broadcastId: string, userId: string) {
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
    console.error('Error expressing interest:', error);
    throw error;
  }
}

/**
 * Sends a push notification to a user
 * @param userId ID of the user to notify
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data to include
 */
async function sendPushNotification(userId: string, title: string, body: string, data: any) {
  try {
    // Get the user's push token
    const { data: user, error } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (user.push_token) {
      // Use Expo's push notification service
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.push_token,
          sound: 'default',
          title,
          body,
          data,
        }),
      });
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}
