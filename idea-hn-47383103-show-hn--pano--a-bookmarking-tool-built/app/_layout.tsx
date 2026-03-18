import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="shelf/[id]" options={{ headerShown: true, title: 'Shelf' }} />
        <Stack.Screen name="paywall" options={{ headerShown: true, title: 'Upgrade to Premium' }} />
      </Stack>
    </PaperProvider>
  );
}
