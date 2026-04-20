import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';
import { Moment } from '../types';

export class NotificationService {
  private db: any;

  constructor() {
    const { db } = useDatabase();
    this.db = db;
    this.configureNotifications();
  }

  private configureNotifications() {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Handle notification responses
    this.setupNotificationResponseHandler();
  }

  private setupNotificationResponseHandler() {
    Notifications.addNotificationResponseReceivedListener(async response => {
      const notificationId = response.notification.request.identifier;
      const momentId = response.notification.request.content.data.momentId;

      // Log notification engagement
      await this.db.logEngagedNotification(notificationId);

      // Navigate to the moment screen
      if (momentId) {
        // In a real app, you would navigate to the moment screen
        console.log(`Navigating to moment: ${momentId}`);
      }
    });
  }

  async scheduleMomentNotification(moment: Moment, time: Date, userId: string) {
    const notificationId = `moment_${moment.id}_${time.getTime()}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Your ${moment.category} moment is ready`,
        body: moment.title,
        sound: 'default',
        data: { momentId: moment.id, notificationId },
      },
      trigger: {
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: false,
      },
    });

    // Store the scheduled notification in the database
    await this.db.scheduleNotification(userId, notificationId, moment.id, time);
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getNotificationPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  async requestNotificationPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
}
