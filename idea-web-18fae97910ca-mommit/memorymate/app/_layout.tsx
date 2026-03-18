import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDB } from '../lib/db';
import { requestNotificationPermissions } from '../lib/notifications';
import { requestLocationPermissions } from '../lib/location';

export default function RootLayout() {
  useEffect(() => {
    initDB();
    requestNotificationPermissions();
    requestLocationPermissions();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-memory" 
        options={{ 
          presentation: 'modal',
          title: 'Add Reminder'
        }} 
      />
      <Stack.Screen name="space/[id]" options={{ title: 'Space Details' }} />
    </Stack>
  );
}
