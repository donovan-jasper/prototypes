import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useNetInfo } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OfflineBanner from '../components/OfflineBanner';

export default function RootLayout() {
  const [offlineMode, setOfflineMode] = useState(false);
  const netInfo = useNetInfo();

  useEffect(() => {
    const loadSettings = async () => {
      const storedOfflineMode = await AsyncStorage.getItem('offlineMode');
      if (storedOfflineMode !== null) {
        setOfflineMode(JSON.parse(storedOfflineMode));
      }
    };
    loadSettings();
  }, []);

  const isOffline = !netInfo.isConnected || offlineMode;

  return (
    <>
      {isOffline && <OfflineBanner />}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="database/[id]" options={{ title: 'Database' }} />
        <Stack.Screen name="database/add" options={{ title: 'Add Database' }} />
      </Stack>
    </>
  );
}
