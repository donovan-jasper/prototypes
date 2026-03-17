import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, Banner } from 'react-native-paper';
import QueryInput from '@/components/QueryInput';
import ResultsTable from '@/components/ResultsTable';
import { useQueryStore } from '@/store/query-store';
import { useDatabaseStore } from '@/store/database-store';
import { generateSQLFromNaturalLanguage } from '@/lib/ai/query-generator';
import { executeQuery } from '@/lib/database/query-executor';
import Constants from 'expo-constants';

const QueryScreen = () => {
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [results, setResults] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');
  const { addQuery } = useQueryStore();
  const { currentDatabase } = useDatabaseStore();

  const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const hasApiKey = !!apiKey;

  const handleGenerateQuery = async (query: string) => {
    if (!hasApiKey) {
      setError('OpenAI API key is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment.');
      return;
    }

    if (!currentDatabase) {
      setError('No database selected. Please select a database first.');
      return;
    }

    if (!currentDatabase.schema) {
      setError('Database schema not loaded. Please refresh the schema in the Explore tab.');
      return;
    }

    setError('');
    setIsGenerating(true);
    setNaturalLanguageQuery(query);

    try {
      const sql = await generateSQLFromNaturalLanguage(query, currentDatabase.schema);
      setGeneratedSQL(sql);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate SQL query';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!currentDatabase) {
      setError('No database selected');
      return;
    }

    if (!generatedSQL.trim()) {
      setError('No query to execute');
      return;
    }

    setError('');
    setIsExecuting(true);

    try {
      const queryResults = await executeQuery(
        currentDatabase.id,
        currentDatabase.connectionString,
        currentDatabase.type,
        generatedSQL
      );
      
      setResults(queryResults);
      addQuery({
        databaseId: currentDatabase.id,
        query: generatedSQL,
        results: queryResults,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute query';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {!hasApiKey && (
        <Banner
          visible={true}
          icon="alert-circle"
          style={styles.banner}
        >
          OpenAI API key not configured. Set EXPO_PUBLIC_OPENAI_API_KEY to use AI features.
        </Banner>
      )}

      {!currentDatabase && (
        <Banner
          visible={true}
          icon="information"
          style={styles.banner}
        >
          No database selected. Go to the home screen to select a database.
        </Banner>
      )}

      <QueryInput
        onGenerateQuery={handleGenerateQuery}
        onExecuteQuery={handleExecuteQuery}
        disabled={!hasApiKey || !currentDatabase}
      />

      {isGenerating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Generating SQL query...</Text>
        </View>
      )}

      {generatedSQL && !isGenerating && (
        <View style={styles.sqlContainer}>
          <Text style={styles.sqlLabel}>Generated SQL:</Text>
          <View style={styles.sqlBox}>
            <Text style={styles.sqlText}>{generatedSQL}</Text>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isExecuting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Executing query...</Text>
        </View>
      )}

      {results.length > 0 && !isExecuting && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsLabel}>Results ({results.length} rows):</Text>
          <ResultsTable data={results} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  banner: {
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  sqlContainer: {
    marginVertical: 16,
  },
  sqlLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sqlBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sqlText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default QueryScreen;
