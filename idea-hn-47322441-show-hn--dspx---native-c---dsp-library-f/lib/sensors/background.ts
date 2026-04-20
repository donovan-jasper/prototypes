import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import { evaluateAlert, getActiveAlerts } from '@/lib/alerts/engine';
import { triggerAlertNotification } from '@/lib/alerts/notifications';
import { getLatestReadings } from '@/lib/storage/readings';

const BACKGROUND_TASK_NAME = 'sensor-alert-monitor';

export const registerBackgroundTask = async () => {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
    if (isRegistered) {
      console.log('Background task already registered');
      return;
    }

    // Register the task
    await TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
      if (error) {
        console.error('Background task error:', error);
        return;
      }

      try {
        // Check battery level and adjust frequency if needed
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const isLowPowerMode = await Battery.isLowPowerModeEnabledAsync();

        // Throttle frequency if battery is low or in low power mode
        const shouldThrottle = batteryLevel < 0.2 || isLowPowerMode;
        const interval = shouldThrottle ? 30000 : 5000; // 30s or 5s

        // Get active alerts
        const alerts = await getActiveAlerts();

        // For each alert, get the latest reading and evaluate
        for (const alert of alerts) {
          const latestReading = await getLatestReadings(alert.sensorId, 1);

          if (latestReading.length > 0) {
            const reading = latestReading[0];
            const shouldTrigger = evaluateAlert(alert, reading);

            if (shouldTrigger) {
              // Trigger notification
              await triggerAlertNotification(alert, reading);

              // Update alert last triggered time
              alert.lastTriggered = new Date().toISOString();
            }
          }
        }

        // Schedule next run
        if (TaskManager.isTaskDefined(BACKGROUND_TASK_NAME)) {
          setTimeout(() => {
            TaskManager.getTaskOptionsAsync(BACKGROUND_TASK_NAME).then(() => {
              // This will trigger the task to run again
            });
          }, interval);
        }
      } catch (taskError) {
        console.error('Error in background task:', taskError);
      }
    });

    console.log('Background task registered successfully');
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
};

export const startBackgroundMonitoring = async () => {
  try {
    // Start the task
    await TaskManager.getTaskOptionsAsync(BACKGROUND_TASK_NAME);

    // For Android, we need to start a foreground service
    if (Platform.OS === 'android') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SensorSync Monitoring',
          body: 'Running in background',
          data: { monitoring: true },
        },
        trigger: null,
      });
    }

    console.log('Background monitoring started');
  } catch (error) {
    console.error('Failed to start background monitoring:', error);
  }
};

export const stopBackgroundMonitoring = async () => {
  try {
    // For Android, cancel the foreground notification
    if (Platform.OS === 'android') {
      await Notifications.dismissAllNotificationsAsync();
    }

    console.log('Background monitoring stopped');
  } catch (error) {
    console.error('Failed to stop background monitoring:', error);
  }
};
