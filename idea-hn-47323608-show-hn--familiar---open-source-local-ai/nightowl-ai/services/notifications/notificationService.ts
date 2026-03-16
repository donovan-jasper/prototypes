import * as Notifications from 'expo-notifications';
import { Task } from '@/types';

export class NotificationService {
  async requestPermissions(): Promise<void> {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }
  }

  async sendSummaryNotification(tasks: Task[]): Promise<void> {
    const title = 'Night Shift Complete';
    const body = this.generateSummaryMessage(tasks);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  }

  async sendAlertNotification(title: string, body: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
  }

  private generateSummaryMessage(tasks: Task[]): string {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const failedTasks = tasks.filter(task => task.status === 'failed');

    let message = '';

    if (completedTasks.length > 0) {
      message += `Completed ${completedTasks.length} tasks: `;
      message += completedTasks.map(task => this.getTaskDescription(task)).join(', ');
    }

    if (failedTasks.length > 0) {
      if (message) message += '\n';
      message += `Failed ${failedTasks.length} tasks: `;
      message += failedTasks.map(task => this.getTaskDescription(task)).join(', ');
    }

    return message || 'Night shift completed with no tasks';
  }

  private getTaskDescription(task: Task): string {
    switch (task.type) {
      case 'organize_photos':
        return `Organized ${task.filesProcessed || 0} photos`;
      case 'process_documents':
        return `Processed ${task.filesProcessed || 0} documents`;
      default:
        return task.type;
    }
  }
}
