import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

interface ScheduleReminderConfig {
  title: string;
  body: string;
  time: string;
}

export async function scheduleReminder(config: ScheduleReminderConfig): Promise<string> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    throw new Error('Notification permissions not granted');
  }

  const [hours, minutes] = config.time.split(':').map(Number);
  
  const trigger: Notifications.NotificationTriggerInput = {
    hour: hours,
    minute: minutes,
    repeats: true,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      sound: 'chime.mp3',
    },
    trigger,
  });

  return notificationId;
}

export async function cancelReminder(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
