import * as Notifications from 'expo-notifications';
import { addRecallAlert, getRecallAlertsForEstablishment, markRecallAlertAsRead } from './database';
import { getSavedLocations } from './database';
import { getRecalls } from './api';
import { router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleRecallAlert = async (establishmentId: string, establishmentName: string, recallDate: string, description: string, severity: string) => {
  try {
    // Add to database first
    const alertId = await addRecallAlert(establishmentId, recallDate, description, severity);

    // Schedule notification
    const trigger = new Date(recallDate);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Food Recall Alert',
        body: `${establishmentName} has a new violation: ${description}`,
        data: {
          establishmentId,
          alertId,
          type: 'recall',
          severity
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling recall alert:', error);
    throw error;
  }
};

export const checkForRecallAlerts = async () => {
  try {
    const savedLocations = await getSavedLocations();

    for (const location of savedLocations) {
      const recalls = await getRecalls(location.establishmentId);

      for (const recall of recalls) {
        // Check if we've already scheduled this notification
        const existingAlerts = await getRecallAlertsForEstablishment(location.establishmentId);
        const alreadyScheduled = existingAlerts.some(alert =>
          alert.recallDate === recall.recallDate &&
          alert.description === recall.description
        );

        if (!alreadyScheduled) {
          await scheduleRecallAlert(
            location.establishmentId,
            location.name,
            recall.recallDate,
            recall.description,
            recall.severity || 'medium'
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking for recall alerts:', error);
  }
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }
  return true;
};

export const setupNotificationHandlers = () => {
  // Handle notification taps
  Notifications.addNotificationResponseReceivedListener(response => {
    const { establishmentId, alertId } = response.notification.request.content.data;

    if (establishmentId) {
      // Mark alert as read
      if (alertId) {
        markRecallAlertAsRead(alertId);
      }

      // Navigate to establishment detail
      router.push({
        pathname: '/establishment/[id]',
        params: { id: establishmentId }
      });
    }
  });
};

export const setupRecallAlerts = async () => {
  // Check for permissions
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Set up notification handlers
  setupNotificationHandlers();

  // Check for recall alerts immediately
  await checkForRecallAlerts();

  // Set up periodic checks (every 6 hours)
  const interval = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  setInterval(async () => {
    await checkForRecallAlerts();
  }, interval);
};

// New function to schedule mock recall alerts for demo purposes
export const scheduleMockRecallAlerts = async () => {
  try {
    const savedLocations = await getSavedLocations();

    if (savedLocations.length === 0) {
      console.log('No saved locations to schedule mock alerts for');
      return;
    }

    // Schedule a mock alert for each saved location
    for (const location of savedLocations) {
      // Check if we've already scheduled a mock alert for this location
      const existingAlerts = await getRecallAlertsForEstablishment(location.establishmentId);
      const hasMockAlert = existingAlerts.some(alert =>
        alert.description.includes('Mock recall alert')
      );

      if (!hasMockAlert) {
        // Schedule a mock alert in 30 seconds
        const triggerDate = new Date(Date.now() + 30000); // 30 seconds from now

        await scheduleRecallAlert(
          location.establishmentId,
          location.name,
          triggerDate.toISOString(),
          'Mock recall alert - This is a test notification for demonstration purposes',
          'low'
        );

        console.log(`Scheduled mock recall alert for ${location.name}`);
      }
    }
  } catch (error) {
    console.error('Error scheduling mock recall alerts:', error);
  }
};
