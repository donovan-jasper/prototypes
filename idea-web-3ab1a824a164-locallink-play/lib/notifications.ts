import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {}
) {
  try {
    // Get the user's push token from the database
    const { data: user, error } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (!user?.push_token) {
      console.log('No push token for user:', userId);
      return;
    }

    // Send the notification
    const message = {
      to: user.push_token,
      sound: 'default',
      title,
      body,
      data,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

export function setupNotificationHandlers() {
  // Handle notifications when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Handle notification responses
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { type, chatId, broadcastId } = response.notification.request.content.data;

    if (type === 'interest' && broadcastId) {
      // Navigate to the broadcast detail
      // This would be handled by the navigation system
    } else if (type === 'chat_unlocked' && chatId) {
      // Navigate to the chat
      // This would be handled by the navigation system
    }
  });

  return () => {
    subscription.remove();
  };
}
