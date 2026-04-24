import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { validateSubmission } from '../utils/submission';

const SubmissionForm = ({ onSubmit }) => {
  const [type, setType] = useState('');
  const [file, setFile] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (validateSubmission({ type, file })) {
      onSubmit({ type, file });
    } else {
      setError('Invalid submission');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Submission Type</Text>
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="e.g., Logo Review"
      />
      <Text>File</Text>
      <TextInput
        style={styles.input}
        value={file}
        onChangeText={setFile}
        placeholder="e.g., test.png"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  error: {
    color: 'red',
  },
});

export default SubmissionForm;
