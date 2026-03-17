import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useDatabase } from '@/hooks/useDatabase';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  const { isInitialized, error } = useDatabase();

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to initialize app: {error.message}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Initializing BridgeCircle...</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
