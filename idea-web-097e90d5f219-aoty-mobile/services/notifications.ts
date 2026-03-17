import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Album } from './database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permissions');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('new-releases', {
      name: 'New Releases',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

export const scheduleNewReleaseNotification = async (
  album: Album,
  artistName: string
): Promise<string | null> => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${artistName} released a new album!`,
        body: `${album.title} • Score: ${album.consensusScore}/100`,
        data: { albumId: album.id, type: 'new-release' },
        sound: true,
      },
      trigger: null, // Send immediately
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
};

export const scheduleHighScoreNotification = async (
  album: Album,
  artistName: string
): Promise<string | null> => {
  if (album.consensusScore < 85) return null;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔥 ${artistName} got a ${album.consensusScore}!`,
        body: `${album.title} is getting rave reviews`,
        data: { albumId: album.id, type: 'high-score' },
        sound: true,
      },
      trigger: null,
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule high score notification:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const setupNotificationListener = (
  onNotificationTap: (albumId: string) => void
): (() => void) => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const albumId = response.notification.request.content.data.albumId as string;
    if (albumId) {
      onNotificationTap(albumId);
    }
  });

  return () => subscription.remove();
};

export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  return await Notifications.getAllScheduledNotificationsAsync();
};
