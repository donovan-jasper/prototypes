import { Stack } from 'expo-router';
import { useStore } from '../store/useStore';

export default function Layout() {
  const { user } = useStore();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="database/[id]" options={{ title: 'Database' }} />
      <Stack.Screen name="row/[id]" options={{ title: 'Row' }} />
    </Stack>
  );
}
