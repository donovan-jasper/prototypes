import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initializeDatabase } from '../lib/database';
import '../global.css';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase().catch((error) => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="activity/[id]" 
        options={{ 
          headerShown: true,
          title: 'Activity Details'
        }} 
      />
    </Stack>
  );
}
