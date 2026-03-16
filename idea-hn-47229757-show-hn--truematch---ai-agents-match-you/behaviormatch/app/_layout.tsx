import { Stack } from 'expo-router';
import Colors from '../constants/Colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="match/[id]" options={{ title: 'Match Details' }} />
      <Stack.Screen name="onboarding/welcome" options={{ title: 'Welcome' }} />
      <Stack.Screen name="onboarding/preferences" options={{ title: 'Preferences' }} />
      <Stack.Screen name="onboarding/permissions" options={{ title: 'Privacy Settings' }} />
    </Stack>
  );
}
