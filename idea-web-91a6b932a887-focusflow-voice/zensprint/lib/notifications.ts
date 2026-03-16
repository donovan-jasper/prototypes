import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { format } from 'date-fns';

export const setupNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  // Schedule daily reminder
  const reminderTime = await SecureStore.getItemAsync('reminderTime');
  if (reminderTime) {
    scheduleDailyReminder(reminderTime);
  }

  // Handle notifications when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};

export const scheduleDailyReminder = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const reminderDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  // If the reminder time is in the past, schedule for tomorrow
  if (reminderDate < now) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for your focus session!",
      body: "Start your sprint and build your streak.",
      sound: 'default',
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
};

export const checkStreakReminder = async () => {
  const lastSessionDate = await SecureStore.getItemAsync('lastSessionDate');
  const today = format(new Date(), 'yyyy-MM-dd');

  if (lastSessionDate && lastSessionDate !== today) {
    const streak = await SecureStore.getItemAsync('currentStreak');
    if (streak && parseInt(streak) > 0) {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Don't break your streak!",
          body: `You're on a ${streak}-day streak. Complete a session today to keep it going.`,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    }
  }
};

export const sendPodNotification = async (podName: string, memberName: string) => {
  Notifications.scheduleNotificationAsync({
    content: {
      title: `${memberName} started a session`,
      body: `Join ${podName} and stay accountable together!`,
      sound: 'default',
    },
    trigger: null, // Show immediately
  });
};
