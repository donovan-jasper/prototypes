import * as Notifications from 'expo-notifications';

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
  }
};

export const scheduleNotification = async (memory: any) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: memory.title,
      body: memory.description,
      sound: 'default',
    },
    trigger: {
      date: new Date(memory.trigger_value),
    },
  });
};

export const cancelNotification = async (memoryId: string) => {
  await Notifications.cancelScheduledNotificationAsync(memoryId);
};
