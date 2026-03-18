import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { initializeDatabase } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/migrations';
import * as SQLite from 'expo-sqlite';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        // Check if database exists and has data
        const db = await SQLite.openDatabaseAsync('audiochain.db');
        const result = await db.getFirstAsync('SELECT name FROM sqlite_master WHERE type="table" AND name="components"');
        
        if (!result) {
          // Database doesn't exist, create it
          await initializeDatabase();
          await seedDatabase();
        } else {
          // Check if components table has data
          const componentCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM components');
          if (componentCount && (componentCount as any).count === 0) {
            // Table exists but is empty, seed it
            await seedDatabase();
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
        setIsLoading(false);
      }
    };

    setupDatabase();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Setting up database...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>Please restart the app</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scanner" options={{ title: 'Scanner' }} />
      <Stack.Screen name="build/[id]" options={{ title: 'Build Detail' }} />
    </Stack>
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
    marginTop: 16,
    fontSize: 16,
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
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
