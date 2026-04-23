import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TaskService } from './TaskService';

export const NotificationService = {
  initialize: async () => {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Set up response handler
    Notifications.addNotificationResponseReceivedListener(async response => {
      const actionIdentifier = response.actionIdentifier;
      const taskId = response.notification.request.content.data.taskId;

      if (actionIdentifier && taskId) {
        if (actionIdentifier.startsWith('complete_')) {
          await TaskService.updateTaskStatus(taskId, true);
        } else if (actionIdentifier.startsWith('snooze_')) {
          // For snooze, we would typically reschedule the notification
          // This is simplified for the example
          await NotificationService.scheduleReminder(
            await TaskService.getTaskById(taskId),
            5 * 60 * 1000 // Snooze for 5 minutes
          );
        }
      }
    });

    return true;
  },

  scheduleReminder: async (task: any, delay?: number) => {
    if (!task.dueDate) return;

    const dueDate = new Date(task.dueDate);
    const now = new Date();

    // If delay is provided, use that instead of the due date
    const triggerDate = delay ? new Date(now.getTime() + delay) : dueDate;

    if (triggerDate <= now) {
      console.warn('Cannot schedule notification for past date');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Aura Reminder',
        body: task.content,
        data: { taskId: task.id },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        actions: [
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
        ],
      },
      trigger: {
        date: triggerDate,
      },
      identifier: `reminder_${task.id}`,
    });
  },

  cancelNotification: async (taskId: number) => {
    await Notifications.cancelScheduledNotificationAsync(`reminder_${taskId}`);
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
    } catch (error) {
      console.error('Failed to update persistent notification:', error);
    }
  }
};
