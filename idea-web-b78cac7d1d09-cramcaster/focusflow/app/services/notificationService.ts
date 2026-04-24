import * as Notifications from 'expo-notifications';

export const blockNotifications = async () => {
  try {
    await Notifications.setNotificationChannelAsync('focus-mode', {
      name: 'Focus Mode',
      importance: Notifications.AndroidImportance.NONE,
      sound: null,
      vibrationPattern: [],
    });
  } catch (error) {
    console.error('Failed to block notifications:', error);
  }
};

export const unblockNotifications = async () => {
  try {
    await Notifications.setNotificationChannelAsync('focus-mode', {
      name: 'Focus Mode',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  } catch (error) {
    console.error('Failed to unblock notifications:', error);
  }
};
