import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import QueryInput from '../../components/QueryInput';
import ResultsTable from '../../components/ResultsTable';
import { useQuery } from '../../hooks/useQuery';

const QueryScreen = () => {
  const [query, setQuery] = useState('');
  const { results, loading, error, executeQuery } = useQuery();

  const handleQuerySubmit = async (text) => {
    setQuery(text);
    await executeQuery(text);
  };

  return (
    <View style={styles.container}>
      <QueryInput onSubmit={handleQuerySubmit} />
      {loading && <Text>Loading...</Text>}
      {error && <Text>Error: {error.message}</Text>}
      {results && <ResultsTable data={results} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default QueryScreen;
