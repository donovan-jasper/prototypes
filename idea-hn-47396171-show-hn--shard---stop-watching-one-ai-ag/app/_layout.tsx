import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';

export default function RootLayout() {
  const { initialize, requestNotificationPermissions } = useTaskStore();

  useEffect(() => {
    initialize();

    // Handle notifications when app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification taps when app is in background
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // You could navigate to the task detail screen here
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="task/[id]" options={{ title: 'Task Details' }} />
      <Stack.Screen name="compare" options={{ title: 'Compare Results' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}
