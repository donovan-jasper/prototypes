import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { SleepDetector } from './sleepDetection';
import { AudioController } from './audioControl';

const BACKGROUND_TASK_NAME = 'sleepcue-background-task';

interface BackgroundTaskData {
  isSleeping: boolean;
  confidence: number;
}

TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }

  const sleepDetector = new SleepDetector();
  const audioController = new AudioController();

  try {
    // Start sleep detection
    let detectionResult: BackgroundTaskData = { isSleeping: false, confidence: 0 };

    await sleepDetector.startDetection((result) => {
      detectionResult = result;
    });

    // Run for 10 minutes (adjust as needed)
    await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));

    // Check if sleep was detected
    if (detectionResult.isSleeping) {
      // Pause audio with fade-out
      await audioController.fadeOutAndPause();
    }

    // Stop detection
    sleepDetector.stopDetection();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task execution error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class BackgroundTaskService {
  public async registerBackgroundTask() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('Background task registered successfully');
    } catch (error) {
      console.error('Failed to register background task:', error);
    }
  }

  public async unregisterBackgroundTask() {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK_NAME);
      console.log('Background task unregistered successfully');
    } catch (error) {
      console.error('Failed to unregister background task:', error);
    }
  }
}
