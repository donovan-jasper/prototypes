import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { initDatabase } from '../lib/database';
import { useAppStore } from '../store/app-store';

export default function RootLayout() {
  const loadGenerations = useAppStore(state => state.loadGenerations);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await loadGenerations();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initialize();
  }, []);

  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </PaperProvider>
  );
}
