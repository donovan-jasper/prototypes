import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="add-task" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Add Task',
            headerBackTitle: 'Cancel'
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
