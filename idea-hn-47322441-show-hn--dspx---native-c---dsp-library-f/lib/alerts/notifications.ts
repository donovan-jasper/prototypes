import * as Notifications from 'expo-notifications';
import { Alert } from '@/types/alerts';
import { SensorReading } from '@/types/sensors';
import { Platform } from 'react-native';

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

  // For Android, create a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('sensor-alerts', {
      name: 'Sensor Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  return true;
};

export const triggerAlertNotification = async (alert: Alert, reading: SensorReading) => {
  let title = '';
  let body = '';

  switch (alert.type) {
    case 'threshold':
      title = `Threshold Alert: ${reading.sensorId}`;
      body = `Value ${reading.value} ${alert.condition} ${alert.value}`;
      break;
    case 'disconnection':
      title = `Disconnection Alert: ${reading.sensorId}`;
      body = `No data received for ${Math.floor((Date.now() - reading.timestamp) / 1000)} seconds`;
      break;
    case 'battery':
      title = `Battery Alert: ${reading.sensorId}`;
      body = `Battery at ${reading.value}%`;
      break;
    case 'pattern':
      title = `Pattern Alert: ${reading.sensorId}`;
      body = `Value ${alert.condition === 'rising' ? 'rising' : 'falling'} rapidly`;
      break;
    default:
      title = `Alert Triggered: ${alert.type}`;
      body = `Sensor ${reading.sensorId} value ${reading.value}`;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { alertId: alert.id, sensorId: reading.sensorId },
      sound: 'default',
      priority: 'high',
      channelId: 'sensor-alerts',
    },
    trigger: null, // Show immediately
  });
};

export const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
  const { alertId, sensorId } = response.notification.request.content.data;

  // Navigate to the sensor detail screen
  // In a real app, this would use navigation
  console.log(`Notification tapped for alert ${alertId} and sensor ${sensorId}`);

  // You would typically use something like:
  // navigation.navigate('SensorDetail', { id: sensorId });
};
