import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from '@/lib/database';
import { useUserStore } from '@/store/userStore';

export default function RootLayout() {
  const loadPreferences = useUserStore(state => state.loadPreferences);

  useEffect(() => {
    initDatabase().then(() => {
      loadPreferences();
    });
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="item/add" options={{ title: 'Add Item', presentation: 'modal' }} />
      <Stack.Screen name="item/[id]" options={{ title: 'Item Details' }} />
    </Stack>
  );
}
