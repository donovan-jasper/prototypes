import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as SQLite from 'expo-sqlite';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const requestPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

const scheduleRenewalNotification = async (subscription) => {
  if (!subscription.renewal_date) return;

  const renewalDate = new Date(subscription.renewal_date);
  const threeDaysBefore = new Date(renewalDate);
  threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

  const now = new Date();
  if (threeDaysBefore <= now) return;

  const identifier = `renewal-${subscription.id}`;

  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: 'Subscription Renewal Reminder',
      body: `${subscription.name} will renew in 3 days for $${subscription.cost.toFixed(2)}`,
      data: { subscriptionId: subscription.id },
    },
    trigger: {
      date: threeDaysBefore,
    },
  });
};

const cancelRenewalNotification = async (subscriptionId) => {
  const identifier = `renewal-${subscriptionId}`;
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
};

const checkUpcomingRenewals = async () => {
  const db = await SQLite.openDatabaseAsync('subsync.db');
  
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  const subscriptions = await db.getAllAsync(
    'SELECT * FROM subscriptions WHERE status = ? AND renewal_date IS NOT NULL AND renewal_date <= ? AND renewal_date > ?',
    ['active', threeDaysFromNow.toISOString(), now.toISOString()]
  );

  for (const subscription of subscriptions) {
    await scheduleRenewalNotification(subscription);
  }
};

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    await checkUpcomingRenewals();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 60 * 60 * 24,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
};

const unregisterBackgroundTask = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
  } catch (error) {
    console.error('Failed to unregister background task:', error);
  }
};

export {
  requestPermissions,
  scheduleRenewalNotification,
  cancelRenewalNotification,
  checkUpcomingRenewals,
  registerBackgroundTask,
  unregisterBackgroundTask,
};
