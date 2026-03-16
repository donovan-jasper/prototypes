import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import VoiceButton from './VoiceButton';

const QueryInput = ({ onSubmit }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    onSubmit(text);
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Ask a question about your data..."
      />
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleSubmit}>
          Submit
        </Button>
        <VoiceButton onResult={setText} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default QueryInput;
