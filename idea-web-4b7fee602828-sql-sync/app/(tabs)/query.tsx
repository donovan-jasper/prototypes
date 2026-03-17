import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import VoiceInput from '../../components/VoiceInput';
import { naturalLanguageQuery } from '../../lib/ai';
import { queryRows } from '../../lib/db';
import { useStore } from '../../store/useStore';

const QueryScreen = () => {
  const [voiceInput, setVoiceInput] = useState('');
  const [results, setResults] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentDb } = useStore();

  const handleVoiceInput = async (input) => {
    setVoiceInput(input);
    await executeQuery(input);
  };

  const executeQuery = async (queryText) => {
    if (!currentDb) {
      Alert.alert('Error', 'Please select a database first');
      return;
    }

    setIsLoading(true);
    try {
      // Get SQL from natural language query
      const sql = await naturalLanguageQuery(queryText, currentDb.schema);

      // Execute the query
      const rows = await queryRows(currentDb.id, sql);

      // Set results and columns
      if (rows.length > 0) {
        setColumns(Object.keys(rows[0]));
      } else {
        setColumns([]);
      }
      setResults(rows);
    } catch (error) {
      console.error('Query error:', error);
      Alert.alert('Query Error', error.message || 'Failed to execute query');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      {columns.map((column, index) => (
        <Text key={index} style={styles.headerCell}>{column}</Text>
      ))}
    </View>
  );

  const renderRow = ({ item }) => (
    <View style={styles.tableRow}>
      {columns.map((column, index) => (
        <Text key={index} style={styles.cell}>{item[column]}</Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Query Database</Text>

      <VoiceInput onTranscription={handleVoiceInput} />

      <TextInput
        style={styles.input}
        placeholder="Ask a question (e.g., 'Show all clients from last month')"
        value={voiceInput}
        onChangeText={setVoiceInput}
        onSubmitEditing={() => executeQuery(voiceInput)}
      />

      <Button
        title="Search"
        onPress={() => executeQuery(voiceInput)}
        disabled={!voiceInput.trim() || isLoading}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Executing query...</Text>
        </View>
      )}

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Results ({results.length})</Text>

          <FlatList
            data={results}
            renderItem={renderRow}
            keyExtractor={(item, index) => index.toString()}
            ListHeaderComponent={renderHeader}
            stickyHeaderIndices={[0]}
            contentContainerStyle={styles.table}
          />
        </View>
      )}

      {results.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <Text>No results to display</Text>
          <Text>Try asking a question like:</Text>
          <Text style={styles.example}>"Show all clients with status 'active'"</Text>
          <Text style={styles.example}>"List all expenses over $100"</Text>
        </View>
      )}
    </View>
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
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  example: {
    marginTop: 4,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default QueryScreen;
