import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const FeedbackForm = ({ onSubmit }) => {
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');

  const handleSubmit = () => {
    onSubmit({ question1, question2 });
  };

  return (
    <View style={styles.container}>
      <Text>Is this clear?</Text>
      <TextInput
        style={styles.input}
        value={question1}
        onChangeText={setQuestion1}
        placeholder="Yes/No"
      />
      <Text>Would you use this?</Text>
      <TextInput
        style={styles.input}
        value={question2}
        onChangeText={setQuestion2}
        placeholder="Yes/No"
      />
      <Button title="Submit Feedback" onPress={handleSubmit} />
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
});

export default FeedbackForm;
