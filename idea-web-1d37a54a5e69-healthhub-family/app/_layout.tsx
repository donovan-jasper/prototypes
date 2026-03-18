import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { initDatabase } from '../lib/database';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="family/add" options={{ presentation: 'modal', headerShown: true, title: 'Add Family Member' }} />
        <Stack.Screen name="reminder/add" options={{ presentation: 'modal', headerShown: true, title: 'Add Reminder' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
