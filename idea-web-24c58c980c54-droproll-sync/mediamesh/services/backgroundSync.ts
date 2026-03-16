import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { syncCloudService } from './cloudSync';
import { getClouds } from '../database/queries';

const BACKGROUND_SYNC_TASK = 'background-sync-task';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  const clouds = await getClouds();
  for (const cloud of clouds) {
    await syncCloudService(cloud.service, cloud.token);
  }

  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export const registerBackgroundSync = async () => {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 6 * 60 * 60, // 6 hours
    stopOnTerminate: false,
    startOnBoot: true,
  });
};
