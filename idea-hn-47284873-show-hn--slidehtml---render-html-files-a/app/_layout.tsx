import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { initDatabase } from '../lib/db/queries';

export default function RootLayout() {
  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="deck/[id]" 
          options={{ 
            headerShown: true,
            title: 'Deck',
            presentation: 'card'
          }} 
        />
      </Stack>
    </PaperProvider>
  );
}
