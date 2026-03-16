import * as Notifications from 'expo-notifications';

export const scheduleNotification = async (title: string, body: string, hours: number) => {
  const trigger = new Date(Date.now() + hours * 60 * 60 * 1000);

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger,
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
