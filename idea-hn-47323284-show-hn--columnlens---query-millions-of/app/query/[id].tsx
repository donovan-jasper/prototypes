import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQueriesStore } from '../../store/queries';
import { executeQuery } from '../../lib/query-engine';
import { useFilesStore } from '../../store/files';
import ChartRenderer from '../../components/ChartRenderer';

const QueryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { queries, addQuery } = useQueriesStore();
  const { getFile } = useFilesStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [columns, setColumns] = useState([]);
  const [executionTime, setExecutionTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const currentQuery = queries.find((q) => q.id === id);
    if (currentQuery) {
      setQuery(currentQuery.sql);
    } else {
      // If no saved query, try to get the table name from the file ID
      const file = getFile(id);
      if (file) {
        setQuery(`SELECT * FROM "${file.id}" LIMIT 100`);
      }
    }
  }, [id, queries]);

  const handleRunQuery = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowChart(false);

    try {
      const result = await executeQuery(query);
      setResults(result.rows);
      setColumns(result.columns);
      setExecutionTime(result.executionTime);
    } catch (err) {
      setError(err.message);
      console.error('Query execution error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuery = () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a query to save');
      return;
    }

    const queryName = prompt('Enter a name for this query:', `Query ${Date.now()}`);
    if (queryName) {
      addQuery({
        id: Date.now().toString(),
        name: queryName,
        sql: query,
        lastRun: Date.now()
      });
      Alert.alert('Success', 'Query saved successfully');
    }
  };

  const handleCreateChart = () => {
    if (results.length === 0) {
      Alert.alert('Error', 'No results to create a chart from');
      return;
    }

    setShowChart(true);
  };

  const handleBackToResults = () => {
    setShowChart(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.editor}
        multiline
        value={query}
        onChangeText={setQuery}
        placeholder="Enter your SQL query here..."
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Run Query"
          onPress={handleRunQuery}
          disabled={isLoading}
        />
        <Button
          title="Save Query"
          onPress={handleSaveQuery}
          disabled={isLoading}
        />
        <Button
          title="Create Chart"
          onPress={handleCreateChart}
          disabled={results.length === 0 || isLoading}
        />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Executing query...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {executionTime > 0 && (
        <Text style={styles.executionTime}>Query executed in {executionTime}ms</Text>
      )}

      {showChart ? (
        <View style={styles.chartContainer}>
          <Button
            title="Back to Results"
            onPress={handleBackToResults}
          />
          <ChartRenderer
            data={{ columns, rows: results }}
            initialType="bar"
            onDataPointClick={(data) => console.log('Data point clicked:', data)}
          />
        </View>
      ) : (
        results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Results ({results.length} rows)</Text>
            <ScrollView horizontal>
              <View>
                <View style={styles.headerRow}>
                  {columns.map((column, index) => (
                    <Text key={index} style={styles.headerCell}>{column}</Text>
                  ))}
                </View>
                <FlatList
                  data={results}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.row}>
                      {columns.map((column, index) => (
                        <Text key={index} style={styles.cell}>{String(item[column])}</Text>
                      ))}
                    </View>
                  )}
                  ListFooterComponent={<View style={{ height: 20 }} />}
                />
              </View>
            </ScrollView>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  editor: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    backgroundColor: 'white',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
  },
  executionTime: {
    textAlign: 'right',
    marginBottom: 8,
    fontSize: 12,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: 'white',
  },
  resultsTitle: {
    padding: 8,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    padding: 8,
    minWidth: 120,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    padding: 8,
    minWidth: 120,
  },
  chartContainer: {
    flex: 1,
    marginTop: 16,
  },
});

export default QueryScreen;
