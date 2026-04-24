import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TextInputScreen = () => {
  const [inputText, setInputText] = useState('');
  const navigation = useNavigation();

  const handleSubmit = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to analyze');
      return;
    }

    if (inputText.length < 10) {
      Alert.alert('Error', 'Please enter at least 10 characters');
      return;
    }

    navigation.navigate('ExtractionScreen', { text: inputText });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Paste your text here or record audio..."
        value={inputText}
        onChangeText={setInputText}
      />
      <Button
        title="Analyze Text"
        onPress={handleSubmit}
        disabled={!inputText.trim()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
});

export default TextInputScreen;
