import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Button, Card, Searchbar, useTheme } from 'react-native-paper';
import { useDatabase } from '../../lib/database';
import { parseVoiceCommand, generateSQL } from '../../lib/ai';
import VoiceInput from '../../components/VoiceInput';
import QueryResults from '../../components/QueryResults';

export default function QueryScreen() {
  const theme = useTheme();
  const { getDatabaseSchema, executeQuery } = useDatabase();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVoiceResult = async (text: string) => {
    setQuery(text);
    await executeQuery(text);
  };

  const executeQuery = async (naturalQuery: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all database schemas
      const schemas = await getDatabaseSchema();

      // Parse the natural language query
      const parsed = parseVoiceCommand(naturalQuery);

      if (parsed.action === 'unknown') {
        setError('Could not understand your query. Please try rephrasing.');
        return;
      }

      // Generate SQL from the parsed command
      const sql = generateSQL(parsed, schemas);

      // Execute the query
      const queryResults = await executeQuery(sql);
      setResults(queryResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      executeQuery(query);
    }
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Ask a question about your data..."
        onChangeText={setQuery}
        value={query}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
      />

      <VoiceInput onResult={handleVoiceResult} />

      {isLoading && <ActivityIndicator size="large" style={styles.loader} />}

      {error && (
        <Card style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
          <Card.Content>
            <Text style={{ color: theme.colors.onErrorContainer }}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {results.length > 0 && (
        <QueryResults data={results} />
      )}

      {results.length === 0 && !isLoading && !error && (
        <View style={styles.emptyState}>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Ask a question about your data to see results
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
  errorCard: {
    marginVertical: 16,
    padding: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});
