import * as Notifications from 'expo-notifications';
import { AppConstants } from '../constants/AppConstants';
import { Task } from '../types/TaskTypes';

export const NotificationService = {
  initialize: async () => {
    await Notifications.setNotificationCategoryAsync(AppConstants.NOTIFICATION_CATEGORY_ID, [
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
    ]);

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  },

  scheduleReminder: async (task: Task) => {
    if (task.type === 'reminder' && task.dueDate) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Aura Reminder',
          body: task.content,
          categoryIdentifier: AppConstants.NOTIFICATION_CATEGORY_ID,
          data: { taskId: task.id },
        },
        trigger: new Date(task.dueDate),
      });
    }
  },

  updatePersistentNotification: async (tasks: Task[]) => {
    if (tasks.length > 0) {
      await Notifications.setNotificationChannelAsync('aura-persistent', {
        name: 'Aura Persistent Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: false,
      });

      await Notifications.presentNotificationAsync({
        content: {
          title: 'Aura',
          body: tasks.map((task) => task.content).join('\n'),
          categoryIdentifier: AppConstants.NOTIFICATION_CATEGORY_ID,
          data: { tasks: tasks.map((task) => task.id) },
        },
        trigger: null,
      });
    }
  },

  handleNotificationAction: async (response: Notifications.NotificationResponse) => {
    const { actionIdentifier, notification } = response;
    const taskId = notification.request.content.data.taskId;

    if (actionIdentifier === AppConstants.NOTIFICATION_ACTION_COMPLETE) {
      // Handle complete action
    } else if (actionIdentifier === AppConstants.NOTIFICATION_ACTION_SNOOZE) {
      // Handle snooze action
    }
  },
};
