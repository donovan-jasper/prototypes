import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="friend/[id]" options={{ title: 'Friend Details' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
