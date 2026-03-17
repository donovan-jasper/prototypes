import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';

const VoiceInput = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState(null);

  const startRecording = async () => {
    setIsRecording(true);
    setError(null);

    try {
      const result = await Speech.recognizeAsync({
        language: 'en-US',
        prompt: 'Speak your query...',
        maxDuration: 30000, // 30 seconds
      });

      if (result.text) {
        setTranscription(result.text);
        onTranscription(result.text);
      } else {
        setError('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      setError('Failed to recognize speech. Please try again.');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isRecording && styles.recordingButton]}
        onPress={startRecording}
        disabled={isRecording}
      >
        {isRecording ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name="mic-outline" size={24} color="#fff" />
        )}
        <Text style={styles.buttonText}>
          {isRecording ? 'Listening...' : 'Tap to Speak'}
        </Text>
      </TouchableOpacity>

      {transcription ? (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionLabel}>You said:</Text>
          <Text style={styles.transcription}>{transcription}</Text>
        </View>
      ) : null}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 3,
  },
  recordingButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  transcriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
  transcriptionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  transcription: {
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default VoiceInput;
