import * as Notifications from 'expo-notifications';
import { Alert } from '@/types/alerts';
import { SensorReading } from '@/types/sensors';

export const setupNotifications = async () => {
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
};

export const triggerAlertNotification = async (alert: Alert, reading: SensorReading) => {
  const title = `Alert Triggered: ${alert.type}`;
  const body = `Sensor ${reading.sensorId} value ${reading.value} ${alert.condition} ${alert.value}`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { alertId: alert.id, sensorId: reading.sensorId },
    },
    trigger: null, // Show immediately
  });
};
