import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';
import { Moment } from '../types';
import { TimingEngine } from './timing-engine';
import { MomentsService } from './moments';

export class NotificationService {
  private db: any;
  private userId: string;

  constructor(userId: string) {
    this.db = useDatabase();
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

  async scheduleMomentNotification(moment: Moment, time: Date, settings: any): Promise<void> {
    // Check if time is within quiet hours
    if (this.isInQuietHours(time, settings.quietHours)) {
      console.log('Notification time is within quiet hours, skipping');
      return;
    }

    const notificationId = `moment_${moment.id}_${time.getTime()}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: settings.notificationStyle === 'direct' ?
          `Time for your ${moment.category} moment` :
          `A moment of ${moment.category} is waiting for you`,
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

    // Get user settings
    const userSettings = await this.db.getUserSettings(this.userId);

    // Get today's moments
    const momentsService = new MomentsService();
    const moments = await momentsService.getTodayMoments(this.userId);

    // Get optimal windows from timing engine
    const timingEngine = new TimingEngine(this.userId);
    const optimalWindows = await timingEngine.calculateOptimalWindows(userSettings);

    // Schedule notifications for each moment in optimal windows
    for (let i = 0; i < moments.length && i < optimalWindows.length; i++) {
      await this.scheduleMomentNotification(moments[i], optimalWindows[i].start, userSettings);
    }
  }

  async cancelAllNotifications(): Promise<void> {
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

  private isInQuietHours(time: Date, quietHours: { start: number, end: number }): boolean {
    const hour = time.getHours();

    if (quietHours.start < quietHours.end) {
      // Quiet hours don't cross midnight
      return hour >= quietHours.start && hour < quietHours.end;
    } else {
      // Quiet hours cross midnight
      return hour >= quietHours.start || hour < quietHours.end;
    }
  }
}
