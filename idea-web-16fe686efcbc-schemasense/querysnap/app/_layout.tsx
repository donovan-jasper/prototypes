import { Stack } from 'expo-router';
import { useEffect } from 'react';
import useStore from '../lib/store';

export default function Layout() {
  const rehydrateConnections = useStore((state) => state.rehydrateConnections);

  useEffect(() => {
    rehydrateConnections();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="database/[id]" options={{ title: 'Database' }} />
    </Stack>
  );
}
