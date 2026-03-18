import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDB } from '../lib/db';

export default function AppLayout() {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="item/[id]" 
        options={{ 
          title: 'Item Details',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="game/[id]" 
        options={{ 
          title: 'Game Details',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="loadout/[id]" 
        options={{ 
          title: 'Loadout Editor',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}
