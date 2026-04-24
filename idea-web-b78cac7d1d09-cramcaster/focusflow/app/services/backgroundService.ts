import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getCalendarEvents, isEventInProgress } from './calendarService';
import { blockNotifications, unblockNotifications } from './notificationService';
import { registerDistractionBlocker, unregisterDistractionBlocker } from './distractionBlocker';

const BACKGROUND_TASK_NAME = 'focusflow-background-task';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const currentTime = new Date();
    const events = await getCalendarEvents();
    const isDuringEvent = isEventInProgress(events, currentTime);

    if (isDuringEvent) {
      await blockNotifications();
      await registerDistractionBlocker();
    } else {
      await unblockNotifications();
      await unregisterDistractionBlocker();
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60, // 1 minute
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background task registered successfully');
  } catch (error) {
    console.error('Failed to register background task:', error);
    throw error;
  }
};

export const unregisterBackgroundTask = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
    console.log('Background task unregistered successfully');
  } catch (error) {
    console.error('Failed to unregister background task:', error);
    throw error;
  }
};
