import { Stack } from 'expo-router';
import AppInitializer from '../components/AppInitializer';

export default function Layout() {
  return (
    <AppInitializer>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="idea/[id]" options={{ title: 'Idea Detail' }} />
      </Stack>
    </AppInitializer>
  );
}
