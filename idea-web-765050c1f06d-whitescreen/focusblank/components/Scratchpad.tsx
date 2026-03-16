import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';

const Scratchpad = () => {
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Quick notes..."
        value={text}
        onChangeText={setText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  input: {
    minHeight: 100,
    fontSize: 16,
  },
});

export default Scratchpad;
