import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { registerBackgroundAudioTask } from '../lib/backgroundAudio';

export default function RootLayout() {
  useEffect(() => {
    // Register the background audio task when the app starts
    registerBackgroundAudioTask();

    // Cleanup on unmount
    return () => {
      // cleanupBackgroundAudio(); // Don't unregister here as we want it to persist
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="session/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
