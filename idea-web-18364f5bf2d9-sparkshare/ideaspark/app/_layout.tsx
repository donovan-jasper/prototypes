import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="idea/[id]" options={{ title: 'Idea Detail' }} />
    </Stack>
  );
}
