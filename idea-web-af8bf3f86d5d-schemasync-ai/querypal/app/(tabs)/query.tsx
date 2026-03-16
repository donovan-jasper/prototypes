import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import QueryInput from '@/components/QueryInput';
import ResultsTable from '@/components/ResultsTable';
import { useQueryStore } from '@/store/query-store';

const QueryScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { addQuery } = useQueryStore();

  const handleGenerateQuery = async (naturalLanguageQuery) => {
    // Call AI to generate SQL query
    const generatedQuery = await generateSQLFromNaturalLanguage(naturalLanguageQuery);
    setQuery(generatedQuery);
  };

  const handleExecuteQuery = async () => {
    // Execute the query and get results
    const queryResults = await executeQuery(query);
    setResults(queryResults);
    addQuery({ query, results: queryResults });
  };

  return (
    <View style={styles.container}>
      <QueryInput
        onGenerateQuery={handleGenerateQuery}
        onExecuteQuery={handleExecuteQuery}
      />
      {results.length > 0 && <ResultsTable data={results} />}
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
