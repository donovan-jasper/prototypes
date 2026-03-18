import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { initDatabase, isDatabaseEmpty } from '../lib/database';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        await initDatabase();
        const isEmpty = await isDatabaseEmpty();
        
        // Only redirect if we're not already on the onboarding screen
        const inOnboarding = segments[0] === 'onboarding';
        
        if (isEmpty && !inOnboarding) {
          router.replace('/onboarding');
        } else if (!isEmpty && inOnboarding) {
          router.replace('/(tabs)');
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Error checking database:', error);
        setIsReady(true);
      }
    };

    checkDatabase();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="review" options={{ title: 'Review Session' }} />
    </Stack>
  );
}
