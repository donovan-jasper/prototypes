import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { startListening } from '../lib/voice';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
}

export default function VoiceInput({ onTranscription }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');

  const handleVoiceInput = async () => {
    setIsListening(true);
    try {
      const text = await startListening();
      setTranscription(text);
      onTranscription(text);
    } catch (error) {
      console.error(error);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={handleVoiceInput}
        disabled={isListening}
        style={styles.button}
      >
        {isListening ? <ActivityIndicator color="#fff" /> : 'Start Listening'}
      </Button>
      <TextInput
        label="Transcription"
        value={transcription}
        onChangeText={setTranscription}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
});
