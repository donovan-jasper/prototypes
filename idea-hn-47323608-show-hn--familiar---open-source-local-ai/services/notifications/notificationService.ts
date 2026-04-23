// services/notifications/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Task } from '@/types';

export class NotificationService {
  constructor() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('NotificationService: Notification permissions not granted.');
    }
    return status === 'granted';
  }

  async sendSummaryNotification(completedTasks: any[]): Promise<void> {
    const permissionGranted = await this.requestPermissions();
    if (!permissionGranted) {
      console.warn('NotificationService: Cannot send summary notification without permissions.');
      return;
    }

    const tasksCount = completedTasks.length;
    const filesProcessed = completedTasks.reduce((sum, task) => sum + (task.filesProcessed || 0), 0);

    let body = `You woke up to ${tasksCount} tasks completed!`;
    if (filesProcessed > 0) {
      body += ` ${filesProcessed} files were organized and processed.`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'NightOwl AI: Night Shift Report 🦉',
        body: body,
        data: { type: 'night_shift_summary', tasks: completedTasks.map(t => t.id) },
      },
      trigger: null, // Send immediately
    });
    console.log('NotificationService: Sent summary notification.');
  }

  async sendAlert(title: string, message: string): Promise<void> {
    const permissionGranted = await this.requestPermissions();
    if (!permissionGranted) {
      console.warn('NotificationService: Cannot send alert notification without permissions.');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `NightOwl AI: ${title}`,
        body: message,
      },
      trigger: null,
    });
    console.log(`NotificationService: Sent alert: ${title} - ${message}`);
  }
}
