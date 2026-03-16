import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { parseVoiceInput } from '../lib/voice';

export default function VoiceInput({ onResult }) {
  const handleVoiceInput = async () => {
    try {
      const result = await Speech.recognizeAsync();
      const parsedResult = parseVoiceInput(result.text);
      onResult(parsedResult);
    } catch (error) {
      console.error('Error recognizing speech:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Voice Input" onPress={handleVoiceInput} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
});
