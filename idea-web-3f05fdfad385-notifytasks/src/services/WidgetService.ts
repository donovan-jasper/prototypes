import * as Application from 'expo-application';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TaskService } from './TaskService';

export const WidgetService = {
  updateHomeWidgets: async () => {
    try {
      const tasks = await TaskService.getActiveGlanceableTasks(3);

      if (Platform.OS === 'ios') {
        // For iOS, we'll use App Groups to share data with the widget extension
        // This would require native code to read from shared storage
        // For now, we'll just trigger a widget reload
        // In a real implementation, you would use:
        // await WidgetCenter.reloadAllTimelines();
      } else if (Platform.OS === 'android') {
        // For Android, we'll use a broadcast to update the widget
        // This would require a native module to handle the broadcast
        // For now, we'll just update the persistent notification
        await WidgetService.updatePersistentNotification(tasks);
      }
    } catch (error) {
      console.error('Failed to update widgets:', error);
    }
  },

  updatePersistentNotification: async (tasks: any[]) => {
    if (Platform.OS !== 'android') return;

    try {
      // Cancel any existing persistent notification
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (tasks.length === 0) return;

      // Create a notification with action buttons for each task
      const notificationContent: Notifications.NotificationContentInput = {
        title: 'Aura Tasks',
        body: tasks.map(task => task.content).join('\n'),
        data: { tasks },
        sound: null,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        sticky: true,
        autoDismiss: false,
      };

      // Add action buttons for each task
      const actions: Notifications.NotificationActionInput[] = tasks.map(task => [
        {
          identifier: `complete_${task.id}`,
          buttonTitle: 'Complete',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: `snooze_${task.id}`,
          buttonTitle: 'Snooze',
          options: {
            opensAppToForeground: false,
          },
        }
      ]).flat();

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null,
        identifier: 'aura_persistent_notification',
      });

      // Note: In a real implementation, you would need to handle the actions
      // in a background task or notification response handler
    } catch (error) {
      console.error('Failed to update persistent notification:', error);
    }
  },

  sendDataToWidget: async (data: any) => {
    // This would be implemented with platform-specific code
    // For iOS: Use App Groups to share data
    // For Android: Use SharedPreferences or a ContentProvider
    console.log('Sending data to widget:', data);
  }
};
