import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { setupRecallAlerts, scheduleMockRecallAlerts } from '@/services/notifications';

export default function RootLayout() {
  // Set up notifications when the app loads
  useEffect(() => {
    // Initialize recall alerts system
    setupRecallAlerts();

    // Schedule mock recall alerts for demo purposes
    scheduleMockRecallAlerts();

    // Set up notification handler for navigation
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { establishmentId } = response.notification.request.content.data;

      if (establishmentId) {
        // Navigate to the establishment detail screen
        // This will be handled by the router in the notification service
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="establishment/[id]"
        options={{
          title: 'Establishment Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
