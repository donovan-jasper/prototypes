import * as Notifications from 'expo-notifications';
import { AppConstants } from '../constants/AppConstants';
import { Task } from '../types/TaskTypes';
import { TaskService } from './TaskService';
import { WidgetService } from './WidgetService';

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
          opensApp
