import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

const QueryInput = ({ onGenerateQuery, onExecuteQuery }) => {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        label="Natural Language Query"
        value={query}
        onChangeText={setQuery}
        multiline
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => onGenerateQuery(query)}
          style={styles.button}
        >
          Generate SQL
        </Button>
        <Button
          mode="outlined"
          onPress={onExecuteQuery}
          style={styles.button}
        >
          Execute Query
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default QueryInput;
