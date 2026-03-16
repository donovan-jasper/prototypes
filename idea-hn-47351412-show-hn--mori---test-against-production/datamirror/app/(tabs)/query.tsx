import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider, Button, TextInput } from 'react-native-paper';
import QueryEditor from '../../components/QueryEditor';
import ResultsTable from '../../components/ResultsTable';
import { executeQuery } from '../../lib/database/query';

export default function QueryScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const result = await executeQuery('snapshot-id', query);
      setResults(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <QueryEditor value={query} onChangeText={setQuery} />
        <Button
          mode="contained"
          onPress={handleExecute}
          loading={loading}
          style={styles.button}
        >
          Execute
        </Button>
        {results && <ResultsTable data={results.rows} />}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    marginVertical: 16,
  },
});
