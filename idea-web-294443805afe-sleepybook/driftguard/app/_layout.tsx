import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as TaskManager from 'expo-task-manager';
import { setupDatabase } from '@/lib/storage/database';

const BACKGROUND_TASK_NAME = 'background-sleep-detection';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  // Implement background detection logic here
});

export default function Layout() {
  useEffect(() => {
    setupDatabase();
    TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME).then((registered) => {
      if (!registered) {
        TaskManager.registerTaskAsync(BACKGROUND_TASK_NAME, {
          minInterval: 15 * 60, // 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
        });
      }
    });
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
