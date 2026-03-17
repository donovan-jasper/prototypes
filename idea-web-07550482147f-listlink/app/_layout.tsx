import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { openDatabase } from '../lib/database';

export default function RootLayout() {
  useEffect(() => {
    openDatabase().catch(console.error);
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="listing/[id]" options={{ title: 'Listing Details' }} />
    </Stack>
  );
}
