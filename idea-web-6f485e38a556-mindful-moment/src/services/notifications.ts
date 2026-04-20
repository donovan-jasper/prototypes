import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';
import { Moment } from '../types';
import { TimingEngine } from './timing-engine';

export class NotificationService {
  private db: any;
  private userId: string;

  constructor(userId: string) {
    const { db } = useDatabase();
    this.db = db;
    this.userId = userId;
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

      // Update timing engine with engagement data
      const timingEngine = new TimingEngine(this.userId);
      await timingEngine.updateUserPatterns({
        notificationId,
        wasIgnored: false,
        timestamp: new Date()
      });

      // Navigate to the moment screen
      if (momentId) {
        // In a real app, you would navigate to the moment screen
        console.log(`Navigating to moment: ${momentId}`);
      }
    });

    // Handle notification dismissals
    Notifications.addNotificationReceivedListener(async notification => {
      const notificationId = notification.request.identifier;
      const isDismissed = notification.request.trigger?.type === 'time' &&
                         new Date() > new Date(notification.request.trigger.timestamp);

      if (isDismissed) {
        // Log notification dismissal
        await this.db.logDismissedNotification(notificationId);

        // Update timing engine with ignored notification
        const timingEngine = new TimingEngine(this.userId);
        await timingEngine.updateUserPatterns({
          notificationId,
          wasIgnored: true,
          timestamp: new Date()
        });
      }
    });
  }

  async scheduleMomentNotification(moment: Moment, time: Date) {
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
    await this.db.scheduleNotification(this.userId, notificationId, moment.id, time);
  }

  async scheduleDailyNotifications(): Promise<void> {
    // Cancel existing notifications
    await this.cancelAllNotifications();

    // Get today's moments
    const momentsService = new MomentsService();
    const moments = await momentsService.getTodayMoments(this.userId);

    // Get optimal windows from timing engine
    const timingEngine = new TimingEngine(this.userId);
    const userSettings = await this.db.getUserSettings(this.userId);
    const optimalWindows = await timingEngine.calculateOptimalWindows(userSettings);

    // Schedule notifications for each moment in optimal windows
    for (let i = 0; i < moments.length && i < optimalWindows.length; i++) {
      await this.scheduleMomentNotification(moments[i], optimalWindows[i].start);
    }
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
