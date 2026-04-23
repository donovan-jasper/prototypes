import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { getAlerts, getSavedDigest } from './database';
import { fetchStockData } from './api';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

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

  // Register background task
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  // Register background task for price alerts
  TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
    if (error) {
      console.error('Background task error:', error);
      return;
    }

    try {
      // Check price alerts
      const alerts = await getAlerts();
      for (const alert of alerts) {
        const stockData = await fetchStockData(alert.symbol);
        const shouldTrigger =
          (alert.condition === 'above' && stockData.price >= alert.target_price) ||
          (alert.condition === 'below' && stockData.price <= alert.target_price);

        if (shouldTrigger) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${alert.symbol} Alert`,
              body: `${alert.symbol} is now ${alert.condition} ${alert.target_price}`,
              sound: 'default',
            },
            trigger: null,
          });
        }
      }

      // Check if we should send daily digest
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check if it's 7 AM (or user's preferred time)
      if (hours === 7 && minutes === 0) {
        const digest = await getSavedDigest();
        if (digest && digest.length > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Daily Market Digest',
              body: 'Your daily market highlights are ready!',
              sound: 'default',
              data: { type: 'digest' },
            },
            trigger: null,
          });
        }
      }
    } catch (err) {
      console.error('Background notification error:', err);
    }
  });

  // Register the task
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Finch App',
      body: 'Notifications are active',
      sound: 'default',
    },
    trigger: null,
  });

  // Start the background task
  await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK)
    .then(async (isRegistered) => {
      if (!isRegistered) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Finch App',
            body: 'Setting up notifications',
            sound: 'default',
          },
          trigger: null,
        });
      }
    });
};

export const scheduleDailyDigestNotification = async (hour: number = 7, minute: number = 0) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Market Digest',
      body: 'Your daily market highlights are ready!',
      sound: 'default',
      data: { type: 'digest' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
};

export const scheduleAlert = async (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
  const alertId = await scheduleAlert(symbol, targetPrice, condition);

  // Also schedule a background check
  if (Platform.OS === 'android') {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Price Alert Set',
        body: `You'll be notified when ${symbol} is ${condition} ${targetPrice}`,
        sound: 'default',
      },
      trigger: null,
    });
  }

  return alertId;
};

export const cancelAlert = async (id: number) => {
  await cancelAlert(id);
};
