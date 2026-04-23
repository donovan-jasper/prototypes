import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

/**
 * Registers for push notifications and gets the push token
 * @returns Promise with the push token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get the push token
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Save the token to the user's profile
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          push_token: token,
        });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Sends a push notification to a user
 * @param userId ID of the user to notify
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data to include
 */
export async function sendPushNotification(userId: string, title: string, body: string, data: any) {
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
          _displayInForeground: true,
        }),
      });
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

/**
 * Configures notification handlers
 */
export function configureNotificationHandlers() {
  // Handle notifications when the app is in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Handle notification responses
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { data } = response.notification.request.content;

    if (data?.type === 'interest') {
      // Handle interest notification
      console.log('Interest notification received:', data);
    } else if (data?.type === 'chat_unlocked') {
      // Handle chat unlocked notification
      console.log('Chat unlocked notification received:', data);
    }
  });

  return () => {
    subscription.remove();
  };
}
