import React, { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { executeQuery } from '../lib/query-engine';

const SQLEditor = ({ onResults }) => {
  const [query, setQuery] = useState('');

  const handleRunQuery = async () => {
    const result = await executeQuery(query);
    onResults(result);
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
});

export default SQLEditor;
