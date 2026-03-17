import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDB } from '@/lib/db';
import { initStorage } from '@/lib/storage';

export default function RootLayout() {
  useEffect(() => {
    async function initialize() {
      await initDB();
      await initStorage();
    }
    initialize();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="item/[id]" 
        options={{ 
          presentation: 'modal',
          headerTitle: 'Item Details'
        }} 
      />
    </Stack>
  );
}
