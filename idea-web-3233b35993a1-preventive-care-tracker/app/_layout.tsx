import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { requestNotificationPermissions } from '../lib/notifications';

export default function RootLayout() {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="appointment/add" 
        options={{ 
          presentation: 'modal',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
