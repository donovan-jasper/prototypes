import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { initializeDatabase } from '../lib/database';

export default function RootLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <SQLiteProvider
      databaseName="pairpurse.db"
      onInit={async (db) => {
        try {
          await initializeDatabase(db);
          setDbInitialized(true);
        } catch (err) {
          console.error('Failed to initialize database:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      }}
    >
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Database Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      ) : !dbInitialized ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e78b7" />
          <Text style={styles.loadingText}>Initializing database...</Text>
        </View>
      ) : (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      )}
    </SQLiteProvider>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
