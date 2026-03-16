import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('You need to enable notifications to use this app!');
  }
};

export const scheduleWateringReminder = async (plant: any) => {
  const nextWateringDate = getNextWateringDate(plant.lastWatered || new Date().toISOString(), plant.wateringFrequency);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Water your ${plant.name}`,
      body: `It's time to water your ${plant.species}!`,
      data: { plantId: plant.id },
    },
    trigger: {
      date: nextWateringDate,
    },
  });

  return notificationId;
};

export const cancelReminder = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const getNextWateringDate = (lastWatered: string, frequency: number) => {
  const lastWateredDate = new Date(lastWatered);
  const nextWateringDate = new Date(lastWateredDate.getTime() + frequency * 24 * 60 * 60 * 1000);
  return nextWateringDate;
};
