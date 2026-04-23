import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { fetchDailyDigest } from './api';
import { Platform } from 'react-native';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

interface Alert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
}

interface DigestHighlight {
  id: string;
  title: string;
  explanation: string;
  impact: 'positive' | 'negative' | 'neutral';
  audioUrl?: string;
}

export const setupNotifications = async () => {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // Register background task for price alerts
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Register background task
  TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
    if (error) {
      console.error('Background task error:', error);
      return;
    }

    // Check price alerts
    await checkPriceAlerts();

    // Schedule next check
    await scheduleNextCheck();
  });

  // Schedule initial check
  await scheduleNextCheck();

  // Schedule daily digest notification
  await scheduleDailyDigestNotification();
};

export const scheduleDailyDigestNotification = async (hour: number = 7, minute: number = 0) => {
  // Cancel any existing digest notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule the new notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Your Daily Digest is ready!",
      body: "3 key market highlights to start your day",
      data: { type: 'daily-digest' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
};

export const scheduleAlert = async (symbol: string, targetPrice: number, condition: 'above' | 'below'): Promise<string> => {
  // In a real app, this would store the alert in SQLite
  const alertId = `${symbol}-${Date.now()}`;

  // Schedule immediate check
  await checkPriceAlerts();

  return alertId;
};

export const cancelAlert = async (alertId: string) => {
  // In a real app, this would remove the alert from SQLite
  console.log('Alert canceled:', alertId);
};

const checkPriceAlerts = async () => {
  // In a real app, this would:
  // 1. Fetch all alerts from SQLite
  // 2. Check current prices for each symbol
  // 3. Trigger notifications when conditions are met

  // For this prototype, we'll just log
  console.log('Checking price alerts...');
};

const scheduleNextCheck = async () => {
  // Schedule the next check in 15 minutes
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Checking price alerts",
      body: "Background task running",
      data: { type: 'price-check' },
    },
    trigger: {
      seconds: 15 * 60, // 15 minutes
      repeats: false,
    },
  });
};

export const sendDailyDigestNotification = async () => {
  try {
    const digest = await fetchDailyDigest();

    // Create a summary of the digest
    const summary = digest.map(h => h.title).join(', ');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your Daily Digest",
        body: summary,
        data: {
          type: 'daily-digest',
          highlights: digest
        },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Failed to send daily digest notification:', error);
  }
};
