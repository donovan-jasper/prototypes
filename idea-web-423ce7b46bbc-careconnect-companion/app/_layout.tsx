import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useShakeDetection } from '../hooks/useShakeDetection';

export default function RootLayout() {
  const { startShakeListener, stopShakeListener } = useShakeDetection();

  useEffect(() => {
    // Start shake listener when app mounts
    startShakeListener();

    // Cleanup on unmount
    return () => {
      stopShakeListener();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="emergency" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}
