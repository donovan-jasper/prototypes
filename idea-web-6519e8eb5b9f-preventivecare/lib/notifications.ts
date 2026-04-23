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

  const recommendations = PREVENTIVE_CARE_RECOMMENDATIONS.find(
    rec => user.age >= rec.ageRange[0] && user.age <= rec.ageRange[1] && rec.gender === user.gender
  );

  if (!recommendations) return;

  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  for (const screening of recommendations.screenings) {
    // Schedule for next occurrence based on frequency
    const nextDate = new Date(today);
    if (screening.frequency === 'annual') {
      nextDate.setFullYear(today.getFullYear() + 1);
    } else if (screening.frequency === 'biennial') {
      nextDate.setFullYear(today.getFullYear() + 2);
    }

    await schedulePreventiveCareReminder(screening.type, nextDate, userId);
  }
}

export async function cancelReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
