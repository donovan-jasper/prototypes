import * as Notifications from 'expo-notifications';

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.error('Notification permissions not granted');
  }
};

export const scheduleAlert = async (symbol: string, targetPrice: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Price Alert for ${symbol}`,
      body: `${symbol} has reached ${targetPrice}`,
    },
    trigger: null,
  });
};

export const sendDailySummary = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Market Summary',
      body: 'Your daily market summary is ready',
    },
    trigger: {
      hour: 8,
      minute: 0,
      repeats: true,
    },
  });
};
