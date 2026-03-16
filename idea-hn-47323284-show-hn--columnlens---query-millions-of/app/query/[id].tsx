import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQueryStore } from '../../store/queries';
import { executeQuery } from '../../lib/query-engine';

const QueryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { queries, saveQuery } = useQueryStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const currentQuery = queries.find((q) => q.id === id);
    if (currentQuery) {
      setQuery(currentQuery.sql);
    }
  }, [id, queries]);

  const handleRunQuery = async () => {
    const result = await executeQuery(query);
    setResults(result.rows);
    setColumns(result.columns);
  };

  const handleSaveQuery = () => {
    saveQuery({ id, sql: query, name: `Query ${id}` });
  };

  const handleCreateChart = () => {
    navigation.navigate('Chart', { id, data: { columns, rows: results } });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.editor}
        multiline
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Run Query" onPress={handleRunQuery} />
      <Button title="Save Query" onPress={handleSaveQuery} />
      <Button title="Create Chart" onPress={handleCreateChart} />
      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {columns.map((column, index) => (
              <Text key={index} style={styles.cell}>{item[column]}</Text>
            ))}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  editor: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    padding: 8,
  },
});

export default QueryScreen;
