import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';
import { getUserPreferences } from './database';

const db = SQLite.openDatabase('streakstack.db');

export async function scheduleDailyCoachNotification(userId: string) {
  // Cancel any existing notifications for this user
  await cancelCoachNotifications(userId);

  // Get user's preferred notification time
  const preferences = await getUserPreferences(userId);
  const notificationTime = preferences?.notificationTime || '09:00';

  // Parse time and create notification date
  const [hours, minutes] = notificationTime.split(':').map(Number);
  const now = new Date();
  const notificationDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  // If time has already passed today, schedule for tomorrow
  if (notificationDate < now) {
    notificationDate.setDate(notificationDate.getDate() + 1);
  }

  // Schedule the notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your AI Coach is waiting",
      body: "Check in with your daily motivation message!",
      sound: 'default',
      data: { type: 'coach-checkin', userId },
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });

  // Store in database for tracking
  await storeScheduledNotification(userId, notificationDate);
}

export async function scheduleHabitReminder(habitId: string, habitName: string, reminderTime: string) {
  // Cancel any existing notifications for this habit
  await cancelHabitNotifications(habitId);

  // Parse time and create notification date
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const now = new Date();
  const notificationDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  // If time has already passed today, schedule for tomorrow
  if (notificationDate < now) {
    notificationDate.setDate(notificationDate.getDate() + 1);
  }

  // Schedule the notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Time for ${habitName}!`,
      body: "Don't forget to complete your habit today!",
      sound: 'default',
      data: { type: 'habit-reminder', habitId },
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });

  // Store in database for tracking
  await storeScheduledNotification(habitId, notificationDate, 'habit-reminder');
}

async function cancelCoachNotifications(userId: string) {
  // Cancel all notifications with this userId
  await Notifications.cancelAsync();

  // Remove from database
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM scheduled_notifications WHERE user_id = ? AND type = ?',
        [userId, 'coach-checkin'],
        () => resolve(),
        (_, error) => {
          console.error('Error canceling notifications:', error);
          resolve();
        }
      );
    });
  });
}

async function cancelHabitNotifications(habitId: string) {
  // Cancel all notifications with this habitId
  await Notifications.cancelAsync();

  // Remove from database
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM scheduled_notifications WHERE user_id = ? AND type = ?',
        [habitId, 'habit-reminder'],
        () => resolve(),
        (_, error) => {
          console.error('Error canceling notifications:', error);
          resolve();
        }
      );
    });
  });
}

async function storeScheduledNotification(
  identifier: string,
  date: Date,
  type: 'coach-checkin' | 'habit-reminder' = 'coach-checkin'
) {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO scheduled_notifications (user_id, type, scheduled_time) VALUES (?, ?, ?)',
        [identifier, type, date.toISOString()],
        () => resolve(),
        (_, error) => {
          console.error('Error storing notification:', error);
          resolve();
        }
      );
    });
  });
}

export async function initializeNotifications() {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Handle notification responses
  Notifications.addNotificationResponseReceivedListener(response => {
    const notificationData = response.notification.request.content.data;
    console.log('Notification response received:', notificationData);
    // You can add navigation logic here based on notification type
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM scheduled_notifications',
        [],
        () => resolve(),
        (_, error) => {
          console.error('Error clearing notifications:', error);
          resolve();
        }
      );
    });
  });
}
