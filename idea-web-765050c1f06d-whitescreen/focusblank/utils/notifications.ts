import * as Notifications from 'expo-notifications';

const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('You need to enable notifications for this app to work properly.');
  }
};

const scheduleNotification = async (title, body, seconds) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      seconds,
    },
  });
};

export { requestPermissions, scheduleNotification };
