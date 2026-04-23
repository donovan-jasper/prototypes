import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { format, isSameDay, parseISO, subDays } from 'date-fns';
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

  // Set up notification categories
  await Notifications.setNotificationCategoryAsync('streak-reminder', [
    {
      identifier: 'mark-completed',
      buttonTitle: 'Mark as Completed',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);

  await Notifications.setNotificationCategoryAsync('streak-warning', [
    {
      identifier: 'start-session',
      buttonTitle: 'Start Session',
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

export const scheduleStreakWarning = async (currentStreak: number) => {
  // Cancel any existing streak warnings
  const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const streakWarnings = existingNotifications.filter(
    n => n.content.categoryIdentifier === 'streak-warning'
  );

  for (const warning of streakWarnings) {
    await Notifications.cancelScheduledNotificationAsync(warning.identifier);
  }

  // Schedule new warning for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't break your streak!",
      body: `You're on a ${currentStreak}-day streak. Complete a session today to keep it going!`,
      sound: 'default',
      categoryIdentifier: 'streak-warning',
    },
    trigger: {
      hour: 9, // Default time for warning
      minute: 0,
      repeats: false,
    },
  });
};

export const checkAndScheduleStreakReminder = async () => {
  const lastSessionDate = await SecureStore.getItemAsync('lastSessionDate');
  const today = new Date();

  if (lastSessionDate) {
    const lastDate = parseISO(lastSessionDate);
    const yesterday = subDays(today, 1);

    if (isSameDay(lastDate, yesterday)) {
      // User completed session yesterday but not today
      const streak = await useStore.getState().userStats.currentStreak;
      await scheduleStreakWarning(streak);
    }
  }
};

export const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
  if (response.notification.request.content.categoryIdentifier === 'streak-reminder') {
    if (response.actionIdentifier === 'mark-completed') {
      // User marked session as completed from notification
      const today = format(new Date(), 'yyyy-MM-dd');
      await SecureStore.setItemAsync('lastSessionDate', today);
      useStore.getState().updateStats();
    }
  } else if (response.notification.request.content.categoryIdentifier === 'streak-warning') {
    if (response.actionIdentifier === 'start-session') {
      // User wants to start a session from warning
      // This would typically open the app to the session screen
      // Implementation would depend on your navigation setup
    }
  }
};

export const setupNotificationListeners = () => {
  const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
  return subscription;
};
