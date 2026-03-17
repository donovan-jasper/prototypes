import * as Notifications from 'expo-notifications';
import { addRecallAlert } from './database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleRecallAlert = async (establishmentId: string, establishmentName: string, recallDate: string, description: string) => {
  try {
    // Add to database first
    await addRecallAlert(establishmentId, recallDate, description);

    // Schedule notification
    const trigger = new Date(recallDate);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Food Recall Alert',
        body: `${establishmentName} has been recalled: ${description}`,
        data: { establishmentId, type: 'recall' },
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling recall alert:', error);
    throw error;
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
