import * as Notifications from 'expo-notifications';

export const scheduleAlert = async (alert: { program: string; time: string; weather: boolean; breakingNews: boolean }) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to send notifications was denied');
    }

    const trigger = new Date();
    const [hours, minutes] = alert.time.split(':').map(Number);
    trigger.setHours(hours, minutes, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Program Alert',
        body: `Don't miss ${alert.program}!`,
      },
      trigger,
    });

    if (alert.weather) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Weather Alert',
          body: 'Severe weather conditions in your area!',
        },
        trigger,
      });
    }

    if (alert.breakingNews) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Breaking News Alert',
          body: 'Breaking news update available!',
        },
        trigger,
      });
    }
  } catch (error) {
    console.error('Error scheduling alert:', error);
    throw error;
  }
};

export const cancelAlert = async (identifier: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error('Error canceling alert:', error);
    throw error;
  }
};
