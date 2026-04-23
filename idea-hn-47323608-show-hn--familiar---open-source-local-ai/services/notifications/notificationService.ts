import * as Notifications from 'expo-notifications';
import { Task } from '@/types';

export class NotificationService {
  constructor() {
    this.setupNotificationHandler();
  }

  private setupNotificationHandler() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async sendSummaryNotification(completedTasks: Task[]): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    const photoTasks = completedTasks.filter(task => task.type === 'organize_photos');
    const documentTasks = completedTasks.filter(task => task.type === 'process_documents');

    let title = 'Night Shift Completed';
    let body = '';

    if (photoTasks.length > 0) {
      const filesProcessed = photoTasks.reduce((sum, task) => sum + (task.filesProcessed || 0), 0);
      body += `${filesProcessed} photos organized. `;
    }

    if (documentTasks.length > 0) {
      const filesProcessed = documentTasks.reduce((sum, task) => sum + (task.filesProcessed || 0), 0);
      body += `${filesProcessed} documents processed.`;
    }

    if (body === '') {
      body = 'All tasks completed successfully.';
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null,
    });
  }

  async sendAlertNotification(title: string, body: string): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null,
    });
  }
}
