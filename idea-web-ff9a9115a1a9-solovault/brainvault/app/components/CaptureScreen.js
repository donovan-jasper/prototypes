import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { saveItem } from '../utils/storage';

const CaptureScreen = () => {
  const [text, setText] = useState('');

  const handleSave = () => {
    saveItem(text);
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setText}
        value={text}
        placeholder="Type or record your thought..."
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default CaptureScreen;
