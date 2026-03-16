import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }
  return true;
};

export const scheduleReminder = async (contactId: string, name: string, triggerDate: Date) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to connect with ${name}!`,
      body: `It's been a while since you last talked to ${name}.`,
      data: { contactId },
    },
    trigger: {
      date: triggerDate,
    },
  });

  return notificationId;
};

export const cancelReminder = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
  const contactId = response.notification.request.content.data.contactId;
  if (contactId) {
    // Navigate to contact detail screen
    // This would typically be handled by your navigation library
    console.log(`Navigate to contact: ${contactId}`);
  }
};

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Add notification response listener
Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
