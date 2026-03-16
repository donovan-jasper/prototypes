import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="canvas/[id]" options={{ title: 'Drawing' }} />
      <Stack.Screen name="collaborate/[shareId]" options={{ title: 'Collaboration' }} />
    </Stack>
  );
}
