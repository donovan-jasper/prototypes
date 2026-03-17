import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import QueryInput from '../../components/QueryInput';
import ResultsTable from '../../components/ResultsTable';
import { useQuery } from '../../hooks/useQuery';
import useStore from '../../lib/store';

const QueryScreen = () => {
  const [query, setQuery] = useState('');
  const { results, loading, error, runQuery } = useQuery();
  const databases = useStore((state) => state.databases);

  const handleQuerySubmit = async (text: string) => {
    setQuery(text);
    if (databases.length > 0) {
      await runQuery(text, databases[0].id);
    }
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
