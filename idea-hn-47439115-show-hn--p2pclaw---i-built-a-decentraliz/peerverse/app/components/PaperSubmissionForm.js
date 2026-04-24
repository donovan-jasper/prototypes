import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { generateProof } from '../utils/crypto';

const PaperSubmissionForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    const proof = generateProof(content);
    onSubmit({ title, content, proof });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
      />
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
    marginBottom: 20,
    padding: 10,
  },
});

export default PaperSubmissionForm;
