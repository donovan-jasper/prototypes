import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getFriends } from './database';
import { calculateStreaks } from './streaks';

export const setupNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  await scheduleDailyNudges();
};

export const scheduleDailyNudges = async () => {
  const friends = await getFriends();
  const streaks = await calculateStreaks(friends);

  const atRiskFriends = friends.filter(friend => {
    const streak = streaks[friend.id];
    return streak && streak.status === 'at-risk';
  });

  if (atRiskFriends.length > 0) {
    const friend = atRiskFriends[Math.floor(Math.random() * atRiskFriends.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time to catch up with ${friend.name}!`,
        body: 'How about sharing a recent memory?',
        data: { friendId: friend.id },
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      },
    });
  }
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
