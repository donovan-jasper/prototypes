import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';

const VoiceInput = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');

  const startRecording = async () => {
    setIsRecording(true);
    try {
      const result = await Speech.recognizeAsync();
      setTranscription(result.text);
      onTranscription(result.text);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={isRecording ? 'Recording...' : 'Start Recording'}
        onPress={startRecording}
        disabled={isRecording}
      />
      <Text style={styles.transcription}>{transcription}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  transcription: {
    marginTop: 8,
    fontSize: 16,
  },
});

export default VoiceInput;
