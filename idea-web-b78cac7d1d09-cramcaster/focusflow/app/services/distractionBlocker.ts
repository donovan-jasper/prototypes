import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

const BLOCKED_APPS = [
  'com.facebook.katana',
  'com.instagram.android',
  'com.whatsapp',
  'com.snapchat.android',
  'com.twitter.android',
  'com.discord',
  'com.slack',
  'com.microsoft.teams',
];

const DISTRACTION_BLOCKER_TASK = 'focusflow-distraction-blocker';

export const registerDistractionBlocker = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(DISTRACTION_BLOCKER_TASK, {
      minimumInterval: 30, // 30 seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Failed to register distraction blocker:', error);
  }
};

export const unregisterDistractionBlocker = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(DISTRACTION_BLOCKER_TASK);
  } catch (error) {
    console.error('Failed to unregister distraction blocker:', error);
  }
};

TaskManager.defineTask(DISTRACTION_BLOCKER_TASK, async () => {
  try {
    if (Platform.OS === 'android') {
      const runningApps = await Application.getRunningApplicationsAsync();

      for (const app of runningApps) {
        if (BLOCKED_APPS.includes(app.packageName)) {
          // In a real implementation, we would force-close the app here
          // This would require native modules or platform-specific code
          console.log(`Detected blocked app: ${app.packageName}`);
        }
      }
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Distraction blocker failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const getBlockedApps = () => BLOCKED_APPS;
export const addBlockedApp = (packageName: string) => {
  if (!BLOCKED_APPS.includes(packageName)) {
    BLOCKED_APPS.push(packageName);
  }
};
export const removeBlockedApp = (packageName: string) => {
  const index = BLOCKED_APPS.indexOf(packageName);
  if (index > -1) {
    BLOCKED_APPS.splice(index, 1);
  }
};
