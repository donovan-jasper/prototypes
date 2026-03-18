import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { initDatabase } from '../lib/database';
import { useAppStore } from '../store/app-store';
import * as MediaLibrary from 'expo-media-library';

export default function RootLayout() {
  const loadGenerations = useAppStore(state => state.loadGenerations);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await loadGenerations();
        
        // Request media library permissions on mount
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Media library permissions not granted');
        }
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
