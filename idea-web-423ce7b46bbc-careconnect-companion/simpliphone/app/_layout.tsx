import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsProvider } from '../contexts/SettingsContext';
import { initDB } from '../database/db';
import { registerNotificationHandlers } from '../services/notifications';
import { detectShakeGesture } from '../services/emergency';

export default function RootLayout() {
  const [isDBReady, setIsDBReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDB();
        setIsDBReady(true);
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError('Failed to initialize database. Using fallback storage.');

        try {
          await AsyncStorage.setItem('db_fallback', 'true');
          setIsDBReady(true);
        } catch (storageErr) {
          console.error('AsyncStorage fallback failed:', storageErr);
          setError('Critical error: Unable to initialize storage.');
        }
      }
    };

    setupDatabase();
  }, []);

  useEffect(() => {
    const subscription = registerNotificationHandlers();
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    const shakeSubscription = detectShakeGesture(() => {
      router.push('/emergency');
    });

    return () => shakeSubscription.remove();
  }, [router]);

  if (error && !isDBReady) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>Please restart the app</Text>
      </View>
    );
  }

  if (!isDBReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing SimpliPhone...</Text>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
