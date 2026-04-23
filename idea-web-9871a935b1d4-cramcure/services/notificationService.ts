import * as Notifications from 'expo-notifications';
import * as SQLite from 'expo-sqlite';
import { predictNextPeriod } from './cyclePredictor';
import { getSymptomsByDateRange } from './database';
import { format, addDays, isAfter, isBefore } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleDailyReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Log your symptoms",
      body: "How are you feeling today? Tap to log your symptoms.",
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour: 18, // 6 PM
      minute: 0,
      repeats: true,
    },
  });
};

export const schedulePeriodReminders = async (db: SQLite.SQLiteDatabase) => {
  // Get all cycles from database
  const cycles = await db.getAllAsync('SELECT * FROM cycles ORDER BY startDate DESC LIMIT 5');

  if (cycles.length < 2) {
    // Not enough data to predict
    return;
  }

  // Predict next period
  const prediction = predictNextPeriod(cycles);

  if (!prediction) return;

  // Schedule reminder 3 days before predicted period
  const reminderDate = addDays(prediction, -3);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your period is coming soon",
      body: "Your period is predicted to start on " + format(prediction, 'MMMM d'),
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      date: reminderDate,
    },
  });

  // Schedule high-pain day reminders
  const symptoms = await getSymptomsByDateRange(db, addDays(prediction, -7), addDays(prediction, 7));

  // Find days with highest pain
  const painDays = symptoms.reduce((acc, symptom) => {
    const day = symptom.cycleDay;
    if (!acc[day]) acc[day] = 0;
    acc[day] += symptom.painLevel;
    return acc;
  }, {});

  // Get top 3 days with highest pain
  const highPainDays = Object.entries(painDays)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => parseInt(day));

  // Schedule reminders for high pain days
  for (const day of highPainDays) {
    const highPainDate = addDays(prediction, day - 1);

    // Only schedule if date is in the future
    if (isAfter(highPainDate, new Date())) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "High pain day alert",
          body: "This is typically a high pain day for you. Use the SOS mode for quick relief.",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: highPainDate,
        },
      });
    }
  }
};

export const scheduleMedicationReminder = async (medicationName: string, time: string) => {
  const [hour, minute] = time.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Medication Reminder",
      body: `Time to take your ${medicationName}`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};
