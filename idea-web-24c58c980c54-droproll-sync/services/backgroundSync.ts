import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { syncCloudService } from './cloudSync';
import { getConnectedClouds } from '../database/queries';
import { findDuplicates } from './duplicateDetector';
import { getAllMedia } from '../database/queries';
import * as Notifications from 'expo-notifications';

const BACKGROUND_SYNC_TASK = 'background-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    // Get all connected clouds
    const clouds = await getConnectedClouds();

    // Sync each cloud
    for (const cloud of clouds) {
      await syncCloudService(cloud.service, cloud.token);
    }

    // Check for duplicates after sync
    const media = await getAllMedia();
    const duplicates = findDuplicates(media);

    if (duplicates.length > 0) {
      // Send notification about duplicates
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Duplicate Photos Found",
          body: `${duplicates.length} duplicate photo${duplicates.length !== 1 ? 's' : ''} detected. Tap to review.`,
          data: { screen: 'duplicates' },
        },
        trigger: null,
      });
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 6 * 60 * 60, // 6 hours
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Failed to register background sync:', error);
  }
}

export async function unregisterBackgroundSync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
  } catch (error) {
    console.error('Failed to unregister background sync:', error);
  }
}
