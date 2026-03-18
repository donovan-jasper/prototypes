import * as Notifications from 'expo-notifications';
import { subWeeks, subDays, subHours } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function scheduleAppointmentReminder(appointment: {
  id: string;
  title: string;
  date: string;
  provider: string;
}): Promise<string[]> {
  const appointmentDate = new Date(appointment.date);
  const now = new Date();
  
  const notificationIds: string[] = [];
  
  const reminders = [
    { trigger: subWeeks(appointmentDate, 1), message: '1 week away' },
    { trigger: subDays(appointmentDate, 1), message: 'Tomorrow' },
    { trigger: subHours(appointmentDate, 1), message: 'In 1 hour' },
  ];
  
  for (const reminder of reminders) {
    if (reminder.trigger > now) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${appointment.title} - ${reminder.message}`,
          body: `${appointment.provider} appointment`,
          data: { appointmentId: appointment.id },
        },
        trigger: reminder.trigger,
      });
      notificationIds.push(id);
    }
  }
  
  return notificationIds;
}

export async function cancelNotifications(notificationIds: string[]): Promise<void> {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
}
