import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';
import { getUserPreferences } from './database';
import { generateCoachMessage, fetchCoachContext } from './ai-coach';
import { addSocialFeedItem } from './database';

const db = SQLite.openDatabase('streakstack.db');

// Initialize notifications
export async function initializeNotifications() {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  return true;
}

// Schedule daily coach notification
export async function scheduleDailyCoachNotification(userId: string) {
  // Cancel any existing notifications for this user
  await cancelCoachNotifications(userId);

  // Get user's preferred notification time
  const preferences = await getUserPreferences(userId);
  const notificationTime = preferences?.notification_time || '09:00';

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
  const notificationId = await Notifications.scheduleNotificationAsync({
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
  await storeScheduledNotification(userId, notificationDate, notificationId, 'coach-checkin');

  return notificationId;
}

// Schedule habit reminder notification
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
  const notificationId = await Notifications.scheduleNotificationAsync({
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
  await storeScheduledNotification(habitId, notificationDate, notificationId, 'habit-reminder');

  return notificationId;
}

// Handle notification response
export async function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const { type, userId, habitId } = response.notification.request.content.data;

  if (type === 'coach-checkin' && userId) {
    // Generate and display coach message
    const context = await fetchCoachContext(userId, habitId);
    const message = await generateCoachMessage(context);

    // Add to social feed
    await addSocialFeedItem(userId, habitId, `received coach message: ${message}`);

    return { type: 'coach-message', message };
  } else if (type === 'habit-reminder' && habitId) {
    // Navigate to habit detail
    return { type: 'habit-detail', habitId };
  }

  return null;
}

// Cancel all coach notifications for a user
async function cancelCoachNotifications(userId: string) {
  // Get all notification IDs for this user
  const notificationIds = await getNotificationIds(userId, 'coach-checkin');

  // Cancel all notifications with these IDs
  if (notificationIds.length > 0) {
    await Notifications.cancelScheduledNotificationsAsync(notificationIds);
  }

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

// Cancel all habit notifications for a habit
async function cancelHabitNotifications(habitId: string) {
  // Get all notification IDs for this habit
  const notificationIds = await getNotificationIds(habitId, 'habit-reminder');

  // Cancel all notifications with these IDs
  if (notificationIds.length > 0) {
    await Notifications.cancelScheduledNotificationsAsync(notificationIds);
  }

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

// Get notification IDs for a specific identifier and type
async function getNotificationIds(identifier: string, type: string): Promise<string[]> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT notification_id FROM scheduled_notifications WHERE user_id = ? AND type = ?',
        [identifier, type],
        (_, { rows }) => {
          const ids = [];
          for (let i = 0; i < rows.length; i++) {
            ids.push(rows.item(i).notification_id);
          }
          resolve(ids);
        },
        (_, error) => {
          console.error('Error fetching notification IDs:', error);
          resolve([]);
        }
      );
    });
  });
}

// Store scheduled notification in database
async function storeScheduledNotification(
  identifier: string,
  date: Date,
  notificationId: string,
  type: 'coach-checkin' | 'habit-reminder'
) {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO scheduled_notifications (user_id, type, notification_id, scheduled_time) VALUES (?, ?, ?, ?)',
        [identifier, type, notificationId, date.toISOString()],
        () => resolve(),
        (_, error) => {
          console.error('Error storing notification:', error);
          resolve();
        }
      );
    });
  });
}
