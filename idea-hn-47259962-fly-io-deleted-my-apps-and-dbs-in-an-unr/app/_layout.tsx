import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { registerForPushNotifications } from '@/lib/notifications';
import { scheduleHealthChecks } from '@/lib/monitoring';
import { openDatabase } from '@/lib/db';

const HEALTH_CHECK_TASK = 'health-check-task';

TaskManager.defineTask(HEALTH_CHECK_TASK, async () => {
  try {
    // Initialize database
    await openDatabase();

    // Perform health checks
    await scheduleHealthChecks();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default function RootLayout() {
  useEffect(() => {
    registerForPushNotifications();
    registerBackgroundTask();
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Initialize database
      await openDatabase();

      // Start initial health checks
      await scheduleHealthChecks();
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  }

  async function registerBackgroundTask() {
    try {
      await BackgroundFetch.registerTaskAsync(HEALTH_CHECK_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (error) {
      console.error('Failed to register background task:', error);
    }
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modals/recovery-action"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
