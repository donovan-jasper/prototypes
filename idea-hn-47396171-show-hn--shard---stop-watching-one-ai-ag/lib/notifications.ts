import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task } from '../types';

export class NotificationManager {
  private static instance: NotificationManager;

  private constructor() {
    this.setupNotifications();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private async setupNotifications() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Handle notification responses
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
  }

  public async scheduleTaskCompletionNotification(task: Task) {
    if (!task.completedAt) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Completed',
        body: `Your task "${task.prompt.substring(0, 30)}..." has finished processing`,
        data: { taskId: task.id },
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  }

  public async scheduleTaskFailureNotification(task: Task) {
    if (!task.completedAt) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Failed',
        body: `Your task "${task.prompt.substring(0, 30)}..." encountered an error`,
        data: { taskId: task.id },
        sound: 'default',
      },
      trigger: null,
    });
  }

  public async scheduleBackgroundTaskNotification(task: Task) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Background Task Processing',
        body: `Your task "${task.prompt.substring(0, 30)}..." is still running in the background`,
        data: { taskId: task.id },
        sound: 'default',
      },
      trigger: null,
    });
  }

  public async checkNotificationPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  public async requestNotificationPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  public async getNotificationPermissionsStatus(): Promise<Notifications.PermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }
}
