import * as Notifications from 'expo-notifications';

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleCheckInReminder = async (connectionId, date) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check-In Reminder',
      body: 'Don\'t forget your scheduled check-in!',
      data: { connectionId },
    },
    trigger: date,
  });
};

export const sendConnectionAcceptedNotification = async (userId, matchName) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Connection Accepted',
      body: `${matchName} has accepted your connection request!`,
      data: { userId },
    },
    trigger: null,
  });
};

export const sendEmergencyAlert = async (connectionId, userName) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Emergency Alert',
      body: `${userName} has not completed their scheduled check-in.`,
      data: { connectionId },
    },
    trigger: null,
  });
};
