import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import VoiceInput from '../components/VoiceInput';
import QueryBuilder from '../components/QueryBuilder';
import useSQLParser from '../hooks/useSQLParser';
import useSQLExecutor from '../hooks/useSQLExecutor';

const Home: React.FC = () => {
  const { query, parseNaturalQuery } = useSQLParser();
  const { executeQuery, result, isLoading } = useSQLExecutor();
  const [parsedQuery, setParsedQuery] = useState<string>('');

  const handleSpeechResults = async (results: string) => {
    try {
      const parsed = await parseNaturalQuery(results);
      setParsedQuery(parsed);
      await executeQuery(parsed);
    } catch (error) {
      console.error('Error processing speech results:', error);
    }
  };

  const handleQueryChange = async (newQuery: string) => {
    setParsedQuery(newQuery);
    await executeQuery(newQuery);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>QueryMentor</Text>
      <VoiceInput onSpeechResults={handleSpeechResults} />
      <Text style={styles.queryLabel}>Generated Query:</Text>
      <Text style={styles.query}>{parsedQuery || query}</Text>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Executing query...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Query Results:</Text>

          {result.error ? (
            <Text style={styles.errorText}>{result.error}</Text>
          ) : (
            <>
              {result.columns.length > 0 && (
                <View style={styles.tableHeader}>
                  {result.columns.map((column, index) => (
                    <Text key={index} style={styles.tableHeaderCell}>{column}</Text>
                  ))}
                </View>
              )}

              {result.rows.length > 0 ? (
                result.rows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.tableRow}>
                    {row.map((cell, cellIndex) => (
                      <Text key={cellIndex} style={styles.tableCell}>{String(cell)}</Text>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.noResultsText}>No results found</Text>
              )}
            </>
          )}
        </View>
      )}

      <QueryBuilder
        tables={['sales', 'customers', 'orders']}
        initialQuery={parsedQuery || query}
        onQueryChange={handleQueryChange}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  queryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  query: {
    fontSize: 16,
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    padding: 8,
  },
});

export default Home;
