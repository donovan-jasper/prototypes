import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { parseQuery } from '../utils/nlpParser';

const QueryBar = ({ onQuery }) => {
  const [query, setQuery] = useState('');

  const handleQuery = () => {
    const filter = parseQuery(query);
    onQuery(filter);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your query..."
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search" onPress={handleQuery} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
  },
});

export default QueryBar;
