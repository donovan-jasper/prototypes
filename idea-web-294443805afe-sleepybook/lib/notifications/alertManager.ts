import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

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

export async function sendTwilioSMS(phoneNumber: string, message: string) {
  // In a real app, this would call your backend API which would use Twilio
  // For this prototype, we'll simulate the SMS sending
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return simulated success response
  return {
    success: true,
    sid: 'SM' + Math.random().toString(36).substring(2, 15),
    message: 'SMS sent successfully',
  };
}
