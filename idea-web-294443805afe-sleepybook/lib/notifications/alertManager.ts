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
  // In a production app, this would call your backend API
  // which would then use Twilio to send the SMS
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);

  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 10% failure rate
      if (Math.random() < 0.1) {
        console.error('SMS sending failed');
        reject(new Error('Failed to send SMS'));
      } else {
        console.log('SMS sent successfully');
        resolve({ success: true });
      }
    }, 1000);
  });
};
