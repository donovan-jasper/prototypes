import { Stack } from 'expo-router';
import { SettingsProvider } from '../contexts/SettingsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="emergency" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </SettingsProvider>
  );
}
