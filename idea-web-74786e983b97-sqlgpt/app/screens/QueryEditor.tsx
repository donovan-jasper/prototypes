import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';

const QueryEditor: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const db = SQLite.openDatabase('querymentor.db');

  const executeQuery = () => {
    setError(null);
    try {
      db.transaction(tx => {
        tx.executeSql(
          query,
          [],
          (_, resultSet) => {
            const rows = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              rows.push(resultSet.rows.item(i));
            }
            setResults(rows);
          },
          (_, error) => {
            setError(error.message);
            return false;
          }
        );
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Query Editor</Text>
      <TextInput
        style={styles.input}
        multiline
        value={query}
        onChangeText={setQuery}
        placeholder="Enter your SQL query"
        defaultValue="SELECT * FROM sales;"
      />
      <Button title="Run Query" onPress={executeQuery} />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
      
      <Text style={styles.resultsTitle}>Results</Text>
      <ScrollView style={styles.results}>
        {results.length === 0 ? (
          <Text>No results yet. Execute a query.</Text>
        ) : (
          results.map((row, index) => (
            <View key={index} style={styles.resultRow}>
              <Text>{JSON.stringify(row)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    textAlignVertical: 'top',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  results: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    backgroundColor: '#f9f9f9',
  },
  resultRow: {
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  errorText: {
    color: '#c62828',
  },
});

export default QueryEditor;
