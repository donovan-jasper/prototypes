import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const setupNotifications = async () => {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return true;
};

export const sendLocalNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: null,
  });
};

export const sendTwilioSMS = async (phoneNumber: string, message: string) => {
  // In a real implementation, this would call your backend API
  // which would then use Twilio to send the SMS
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);

  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('SMS sent successfully');
      resolve({ success: true });
    }, 1000);
  });
};
