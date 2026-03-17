import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AppConstants } from '../constants/AppConstants';
import { Task } from '../types/TaskTypes';
import { TaskService } from './TaskService';
import { WidgetService } from './WidgetService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

let notificationListener: Notifications.Subscription | null = null;
let responseListener: Notifications.Subscription | null = null;

export const NotificationService = {
  initialize: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return;
    }

    await Notifications.setNotificationCategoryAsync(
      AppConstants.NOTIFICATION_CATEGORY_ID,
      [
        {
          identifier: AppConstants.NOTIFICATION_ACTION_COMPLETE,
          buttonTitle: 'Complete',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: AppConstants.NOTIFICATION_ACTION_SNOOZE,
          buttonTitle: 'Snooze',
          options: {
            opensAppToForeground: false,
          },
        },
      ]
    );

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('aura-persistent', {
        name: 'Aura Tasks',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6200ee',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('aura-reminders', {
        name: 'Aura Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6200ee',
        sound: 'default',
      });
    }

    if (responseListener) {
      responseListener.remove();
    }

    responseListener = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        await NotificationService.handleNotificationAction(response);
      }
    );
  },

  scheduleReminder: async (task: Task) => {
    if (!task.dueDate) {
      return;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Aura Reminder',
          body: task.content,
          categoryIdentifier: AppConstants.NOTIFICATION_CATEGORY_ID,
          data: { taskId: task.id },
          sound: 'default',
        },
        trigger: task.dueDate,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  },

  updatePersistentNotification: async (tasks: Task[]) => {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      await Notifications.dismissAllNotificationsAsync();

      if (tasks.length === 0) {
        return;
      }

      const taskList = tasks
        .slice(0, 5)
        .map((task, index) => `${index + 1}. ${task.content}`)
        .join('\n');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Aura - ${tasks.length} Active Task${tasks.length > 1 ? 's' : ''}`,
          body: taskList,
          categoryIdentifier: AppConstants.NOTIFICATION_CATEGORY_ID,
          data: { 
            tasks: tasks.map(t => t.id),
            isPersistent: true,
          },
          sticky: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error updating persistent notification:', error);
    }
  },

  handleNotificationAction: async (response: Notifications.NotificationResponse) => {
    const { actionIdentifier, notification } = response;
    const { taskId } = notification.request.content.data as { taskId?: number };

    if (!taskId) {
      return;
    }

    try {
      if (actionIdentifier === AppConstants.NOTIFICATION_ACTION_COMPLETE) {
        await TaskService.updateTaskStatus(taskId, true);
        
        const glanceableTasks = await TaskService.getActiveGlanceableTasks();
        await NotificationService.updatePersistentNotification(glanceableTasks);
        await WidgetService.updateHomeWidgets(glanceableTasks);
      } else if (actionIdentifier === AppConstants.NOTIFICATION_ACTION_SNOOZE) {
        const task = await TaskService.getTaskById(taskId);
        if (task && task.dueDate) {
          const snoozeDate = new Date(Date.now() + 15 * 60 * 1000);
          await TaskService.updateTask(task.id, task.content, task.type, snoozeDate);
          await NotificationService.scheduleReminder({
            ...task,
            dueDate: snoozeDate,
          });
        }
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  },

  cancelNotification: async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  cleanup: () => {
    if (notificationListener) {
      notificationListener.remove();
      notificationListener = null;
    }
    if (responseListener) {
      responseListener.remove();
      responseListener = null;
    }
  },
};
