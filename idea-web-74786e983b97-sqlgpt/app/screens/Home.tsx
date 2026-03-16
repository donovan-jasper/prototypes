import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import VoiceInput from '../components/VoiceInput';
import QueryBuilder from '../components/QueryBuilder';
import useSQLParser from '../hooks/useSQLParser';

const Home: React.FC = () => {
  const { query, parseNaturalQuery } = useSQLParser();

  const handleSpeechResults = (results: string) => {
    parseNaturalQuery(results);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>QueryMentor</Text>
      <VoiceInput onSpeechResults={handleSpeechResults} />
      <Text style={styles.queryLabel}>Generated Query:</Text>
      <Text style={styles.query}>{query}</Text>
      <QueryBuilder 
        tables={['sales', 'customers', 'orders']} 
        onQueryChange={(newQuery) => console.log(newQuery)} 
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
  },
});

export default Home;
