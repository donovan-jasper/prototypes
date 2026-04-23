import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getSchema } from '@/lib/storage/cache';
import SchemaTree from '@/components/SchemaTree';
import { useNetworkStore } from '@/store/network-store';
import { Button } from 'react-native-paper';

export default function ExploreScreen() {
  const { databaseId } = useLocalSearchParams();
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useNetworkStore();

  const loadSchema = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const schemaData = await getSchema(databaseId as string, forceRefresh);
      setSchema(schemaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchema();
  }, [databaseId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading schema...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        {!isOnline && (
          <Text style={styles.offlineText}>You are currently offline</Text>
        )}
        <Button
          mode="contained"
          onPress={() => loadSchema(true)}
          style={styles.retryButton}
        >
          {isOnline ? 'Retry' : 'Try Offline Cache'}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Working offline</Text>
        </View>
      )}
      <SchemaTree schema={schema} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  offlineText: {
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  offlineBanner: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    alignItems: 'center',
  },
});
