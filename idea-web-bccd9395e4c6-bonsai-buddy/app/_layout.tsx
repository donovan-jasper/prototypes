import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppProvider } from '../contexts/AppContext';
import { useEffect } from 'react';
import { openDatabase } from '../lib/database';
import { requestNotificationPermissions } from '../lib/notifications';

export default function RootLayout() {
  useEffect(() => {
    openDatabase();
    requestNotificationPermissions();
  }, []);

  return (
    <AppProvider>
      <PaperProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="plant/[id]" options={{ title: 'Plant Detail' }} />
          <Stack.Screen name="plant/add" options={{ title: 'Add Plant' }} />
        </Stack>
      </PaperProvider>
    </AppProvider>
  );
}
