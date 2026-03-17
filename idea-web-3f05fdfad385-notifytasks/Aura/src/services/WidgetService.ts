import { Task } from '../types/TaskTypes';
import { AppConstants } from '../constants/AppConstants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const WidgetService = {
  updateHomeWidgets: async (tasks: Task[]) => {
    try {
      const widgetData = tasks.map(task => ({
        id: task.id,
        content: task.content,
        type: task.type,
        isCompleted: task.isCompleted,
      }));

      const jsonData = JSON.stringify(widgetData);

      if (Platform.OS === 'ios') {
        // For iOS, write to App Groups shared container
        // This requires native module implementation
        // For now, we'll use AsyncStorage as a placeholder
        await AsyncStorage.setItem(AppConstants.WIDGET_DATA_KEY, jsonData);
      } else if (Platform.OS === 'android') {
        // For Android, write to SharedPreferences
        // This requires native module implementation
        await AsyncStorage.setItem(AppConstants.WIDGET_DATA_KEY, jsonData);
      }
    } catch (error) {
      console.error('Error updating home widgets:', error);
    }
  },

  updateLiveActivity: async (task: Task) => {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      const activityData = {
        id: task.id,
        content: task.content,
        type: task.type,
        isCompleted: task.isCompleted,
        dueDate: task.dueDate?.toISOString(),
      };

      // This would use ActivityKit on iOS
      // For now, we'll store it for future implementation
      await AsyncStorage.setItem('AURA_LIVE_ACTIVITY', JSON.stringify(activityData));
    } catch (error) {
      console.error('Error updating Live Activity:', error);
    }
  },

  sendDataToWidget: async (tasks: Task[]) => {
    await WidgetService.updateHomeWidgets(tasks);
  },
};
