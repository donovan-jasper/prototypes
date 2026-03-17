import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

interface QueryInputProps {
  onGenerateQuery: (query: string) => void;
  onExecuteQuery: () => void;
  disabled?: boolean;
}

const QueryInput = ({ onGenerateQuery, onExecuteQuery, disabled = false }: QueryInputProps) => {
  const [query, setQuery] = useState('');

  const handleGenerate = () => {
    if (query.trim()) {
      onGenerateQuery(query);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Ask a question about your data"
        value={query}
        onChangeText={setQuery}
        multiline
        numberOfLines={3}
        style={styles.input}
        placeholder="e.g., Show me all users who signed up last week"
        disabled={disabled}
      />
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleGenerate}
          style={styles.button}
          disabled={disabled || !query.trim()}
        >
          Generate SQL
        </Button>
        <Button
          mode="outlined"
          onPress={onExecuteQuery}
          style={styles.button}
          disabled={disabled}
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
