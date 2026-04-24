import * as Notifications from 'expo-notifications';

export const blockNotifications = async () => {
  try {
    // Set notification channel to low importance
    await Notifications.setNotificationChannelAsync('focus-mode', {
      name: 'Focus Mode',
      importance: Notifications.AndroidImportance.MIN,
      sound: null,
      vibrationPattern: [],
    });

    // Set notification category to silent
    await Notifications.setNotificationCategoryAsync('focus-mode', {
      allowAlert: false,
      allowBadge: false,
      allowSound: false,
      allowAnnouncement: false,
    });

    console.log('Notifications blocked');
  } catch (error) {
    console.error('Failed to block notifications:', error);
  }
};

export const unblockNotifications = async () => {
  try {
    // Reset notification channel to default
    await Notifications.setNotificationChannelAsync('focus-mode', {
      name: 'Focus Mode',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });

    // Reset notification category
    await Notifications.setNotificationCategoryAsync('focus-mode', {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncement: true,
    });

    console.log('Notifications unblocked');
  } catch (error) {
    console.error('Failed to unblock notifications:', error);
  }
};
