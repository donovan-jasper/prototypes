import * as Notifications from 'expo-notifications';

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleHabitReminder = async (habitId, time) => {
  const trigger = new Date();
  trigger.setHours(time.hours, time.minutes, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to log your habit!",
      body: `Don't forget to complete your habit.`,
      data: { habitId },
    },
    trigger,
  });
};

export const schedulePreventiveCareReminder = async (type, date) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming preventive care",
      body: `Don't forget your ${type} on ${date.toLocaleDateString()}.`,
      data: { type },
    },
    trigger: date,
  });
};

export const cancelReminder = async (id) => {
  await Notifications.cancelScheduledNotificationAsync(id);
};
