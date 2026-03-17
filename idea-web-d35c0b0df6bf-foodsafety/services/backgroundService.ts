import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { generateRandomRecallAlerts } from './api';
import { scheduleRecallAlert } from './notifications';
import { getSavedLocations } from './database';

const BACKGROUND_TASK_NAME = 'foodguard-recall-checker';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    console.log('Running background recall check...');

    // Generate random recall alerts
    await generateRandomRecallAlerts();

    // Get saved locations
    const savedLocations = await getSavedLocations();

    // Check for new recalls for saved locations
    for (const location of savedLocations) {
      // In a real app, we would fetch actual recalls from the API
      // For now, we'll simulate it by checking our mock data
      // This is just a placeholder - in production you would call your actual API
      const recalls = await getRecalls(location.establishmentId);

      if (recalls.length > 0) {
        const latestRecall = recalls[0];
        await scheduleRecallAlert(
          location.establishmentId,
          location.name,
          latestRecall.recallDate,
          latestRecall.description
        );
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundService = async () => {
  try {
    // Register the background task
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60 * 15, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('Background service registered successfully');
  } catch (error) {
    console.error('Failed to register background service:', error);
  }
};

export const unregisterBackgroundService = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
    console.log('Background service unregistered');
  } catch (error) {
    console.error('Failed to unregister background service:', error);
  }
};
