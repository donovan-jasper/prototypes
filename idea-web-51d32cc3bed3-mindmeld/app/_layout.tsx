import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../lib/database';

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-reminder" options={{ presentation: 'modal', title: 'Add Reminder' }} />
    </Stack>
  );
}
