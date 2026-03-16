import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PaperProvider theme={MD3LightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="contact/[id]"
          options={{ title: 'Contact Details' }}
        />
        <Stack.Screen
          name="+not-found"
          options={{ title: 'Oops!' }}
        />
      </Stack>
    </PaperProvider>
  );
}
