import * as Notifications from 'expo-notifications';

export const scheduleNotification = async (title: string, body: string, delay: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      seconds: delay,
    },
  });
};

export const calculateNextReminder = (lastCompleted: Date): Date => {
  const now = new Date();
  const diff = now.getTime() - lastCompleted.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 2) {
    return new Date(now.getTime() + 2 * 60 * 60 * 1000);
  } else if (hours < 4) {
    return new Date(now.getTime() + 4 * 60 * 60 * 1000);
  } else {
    return new Date(now.getTime() + 6 * 60 * 60 * 1000);
  }
};

export const shouldSendReminder = (time: Date): boolean => {
  const hours = time.getHours();
  return hours >= 7 && hours < 22;
};
