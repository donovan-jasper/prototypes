import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { format, isSameDay, parseISO } from 'date-fns';
import { useStore } from '../store/useStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const setupNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Set up notification category for streak reminders
  await Notifications.setNotificationCategoryAsync('streak-reminder', [
    {
      identifier: 'mark-completed',
      buttonTitle: 'Mark as Completed',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);

  return true;
};

export const scheduleDailyReminder = async (hour: number, minute: number) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for your focus session!",
      body: "Your streak is waiting - start a session now to keep it going!",
      sound: 'default',
      categoryIdentifier: 'streak-reminder',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });

  // Store the reminder time for later use
  await SecureStore.setItemAsync('reminderTime', JSON.stringify({ hour, minute }));
};

export const checkAndScheduleStreakReminder = async () => {
  const lastSessionDate = await SecureStore.getItemAsync('lastSessionDate');
  const today = new Date();

  if (lastSessionDate) {
    const lastDate = parseISO(lastSessionDate);
    if (!isSameDay(lastDate, today)) {
      // User hasn't completed a session today
      const streak = await useStore.getState().getStreak();

      if (streak > 0) {
        // Schedule immediate reminder if streak is at risk
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Don't break your streak!",
            body: `You're on a ${streak}-day streak. Complete a session now to keep it going!`,
            sound: 'default',
            categoryIdentifier: 'streak-reminder',
          },
          trigger: null, // Immediate notification
        });
      }
    }
  }
};

export const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
  if (response.notification.request.content.categoryIdentifier === 'streak-reminder') {
    if (response.actionIdentifier === 'mark-completed') {
      // User marked session as completed from notification
      const today = format(new Date(), 'yyyy-MM-dd');
      await SecureStore.setItemAsync('lastSessionDate', today);
      useStore.getState().updateStats(25); // Default session duration
    }
  }
};

export const setupNotificationListeners = () => {
  const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
  return subscription;
};
