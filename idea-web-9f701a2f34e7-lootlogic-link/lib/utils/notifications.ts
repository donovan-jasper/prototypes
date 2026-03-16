import * as Notifications from 'expo-notifications';

interface Alert {
  title: string;
  body: string;
  trigger: { seconds: number };
}

export const scheduleAlertNotification = async (alert: Alert): Promise<string> => {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: alert.title,
      body: alert.body,
    },
    trigger: alert.trigger,
  });
};

export const requestNotificationPermissions = async (): Promise<void> => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('You need to enable notifications to use this feature!');
  }
};
