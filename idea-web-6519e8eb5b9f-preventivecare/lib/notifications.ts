import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDatabase } from './database';
import { PREVENTIVE_CARE_RECOMMENDATIONS } from '../constants/PreventiveCare';

export async function requestNotificationPermissions() {
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

export async function scheduleHabitReminder(habitId: number, time: Date) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to complete your habit!",
      body: "Don't forget to log your habit for today",
      data: { type: 'habit', habitId },
    },
    trigger: {
      hour: time.getHours(),
      minute: time.getMinutes(),
      repeats: true,
    },
  });
}

export async function schedulePreventiveCareReminder(type: string, date: Date, userId: number) {
  const db = await getDatabase();
  const user = await db.getFirstAsync('SELECT age, gender FROM users WHERE id = ?', [userId]);

  if (!user) return;

  // First cancel any existing notification for this screening type
  const existing = await db.getFirstAsync(
    'SELECT notification_id FROM notifications WHERE user_id = ? AND screening_type = ?',
    [userId, type]
  );

  if (existing) {
    await Notifications.cancelScheduledNotificationAsync(existing.notification_id);
    await db.runAsync(
      'DELETE FROM notifications WHERE notification_id = ?',
      [existing.notification_id]
    );
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Preventive Care Reminder",
      body: `It's time for your ${type} screening`,
      data: { type: 'preventive_care', screeningType: type },
    },
    trigger: {
      date: date,
    },
  });

  // Store the notification ID in the database for future reference
  await db.runAsync(
    'INSERT INTO notifications (user_id, type, screening_type, notification_id, scheduled_date) VALUES (?, ?, ?, ?, ?)',
    [userId, 'preventive_care', type, notificationId, date.toISOString()]
  );
}

export async function scheduleAllPreventiveCareReminders(userId: number) {
  const db = await getDatabase();
  const user = await db.getFirstAsync('SELECT age, gender FROM users WHERE id = ?', [userId]);

  if (!user) return;

  // Cancel all existing preventive care notifications
  const existingNotifications = await db.getAllAsync(
    'SELECT notification_id FROM notifications WHERE user_id = ? AND type = ?',
    [userId, 'preventive_care']
  );

  for (const notif of existingNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notif.notification_id);
  }

  await db.runAsync(
    'DELETE FROM notifications WHERE user_id = ? AND type = ?',
    [userId, 'preventive_care']
  );

  const recommendations = PREVENTIVE_CARE_RECOMMENDATIONS.find(
    rec => user.age >= rec.ageRange[0] && user.age <= rec.ageRange[1] && rec.gender === user.gender
  );

  if (!recommendations) return;

  const today = new Date();

  for (const screening of recommendations.screenings) {
    // Check if there's already a completed entry for this screening type
    const lastCompleted = await db.getFirstAsync(
      'SELECT date FROM timeline_events WHERE type = ? AND user_id = ? AND completed = 1 ORDER BY date DESC LIMIT 1',
      ['preventive_care', userId]
    );

    let nextDate: Date;

    if (lastCompleted) {
      // Schedule based on last completed date
      const lastDate = new Date(lastCompleted.date);
      nextDate = new Date(lastDate);

      if (screening.frequency === 'annual') {
        nextDate.setFullYear(lastDate.getFullYear() + 1);
      } else if (screening.frequency === 'biennial') {
        nextDate.setFullYear(lastDate.getFullYear() + 2);
      } else if (screening.frequency === 'every 10 years') {
        nextDate.setFullYear(lastDate.getFullYear() + 10);
      }
    } else {
      // First time - schedule for next occurrence based on frequency
      nextDate = new Date(today);
      if (screening.frequency === 'annual') {
        nextDate.setFullYear(today.getFullYear() + 1);
      } else if (screening.frequency === 'biennial') {
        nextDate.setFullYear(today.getFullYear() + 2);
      } else if (screening.frequency === 'every 10 years') {
        nextDate.setFullYear(today.getFullYear() + 10);
      }
    }

    // Only schedule if the date is in the future
    if (nextDate > today) {
      await schedulePreventiveCareReminder(screening.type, nextDate, userId);
    }
  }
}

export async function cancelReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
