import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async () => {
  if (!Device.isDevice) {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

export const scheduleDaily = async (times: string[]) => {
  await cancelAll();

  for (const time of times) {
    const [hours, minutes] = time.split(':').map(Number);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your daily affirmation awaits',
        body: 'Take a moment for yourself',
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }
};

export const cancelAll = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const trackEngagement = async (opened: boolean) => {
  // Log engagement for adaptive timing
  return opened;
};
