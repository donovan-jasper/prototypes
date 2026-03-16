import * as TaskManager from 'expo-task-manager';
import * as Application from 'expo-application';
import { logAppUsage } from '../database';
import { detectContext } from '../context/detector';

const USAGE_TRACKER_TASK = 'usage-tracker-task';

TaskManager.defineTask(USAGE_TRACKER_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Error in usage tracker:', error);
    return;
  }

  if (data) {
    const { packageName, appName, timestamp, duration } = data;
    const context = await detectContext();
    logAppUsage(packageName, appName, timestamp, duration, context.time, context.location);
  }
});

export const startUsageTracker = async () => {
  await Application.registerTaskAsync(USAGE_TRACKER_TASK);
};
