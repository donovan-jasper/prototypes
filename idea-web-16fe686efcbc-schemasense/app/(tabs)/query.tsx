import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { QueryInput } from '../../components/QueryInput';
import { ResultsTable } from '../../components/ResultsTable';
import { useQuery } from '../../hooks/useQuery';
import { useDatabase } from '../../hooks/useDatabase';
import { useSubscription } from '../../hooks/useSubscription';
import { useRouter } from 'expo-router';

export default function QueryScreen() {
  const router = useRouter();
  const { currentDatabase } = useDatabase();
  const { executeQuery, isLoading, error } = useQuery();
  const { checkQueryLimit } = useSubscription();
  const [results, setResults] = useState<any[]>([]);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const handleQuerySubmit = async (queryText: string) => {
    if (!currentDatabase) {
      router.push('/(tabs)/');
      return;
    }

    const canExecute = await checkQueryLimit();
    if (!canExecute) {
      router.push('/(tabs)/settings');
      return;
    }

    try {
      const queryResults = await executeQuery(currentDatabase.id, queryText);
      setResults(queryResults);
      setQueryHistory(prev => [queryText, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error('Query execution failed:', err);
    }
  };

  if (!currentDatabase) {
    return (
      <View style={styles.emptyState}>
        <Text>No database selected. Please import a database first.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <QueryInput onSubmit={handleQuerySubmit} />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {results.length > 0 && (
          <ResultsTable data={results} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    margin: 16,
  },
  errorText: {
    color: '#D32F2F',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
