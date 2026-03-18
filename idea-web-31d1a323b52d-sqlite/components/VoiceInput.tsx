import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, ActivityIndicator, Text } from 'react-native-paper';
import { startListening, stopListening, VoiceRecognitionError } from '../lib/voice';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
}

type ListeningState = 'idle' | 'listening' | 'processing';

export default function VoiceInput({ onTranscription }: VoiceInputProps) {
  const [state, setState] = useState<ListeningState>('idle');
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVoiceInput = async () => {
    setError(null);
    setState('listening');
    
    try {
      const text = await startListening();
      setState('processing');
      
      // Small delay to show processing state
      setTimeout(() => {
        setTranscription(text);
        onTranscription(text);
        setState('idle');
      }, 300);
    } catch (err) {
      const error = err as VoiceRecognitionError;
      setState('idle');
      
      let errorMessage = 'Failed to recognize speech';
      if (error.code === 'PERMISSION_DENIED') {
        errorMessage = 'Microphone permission denied. Please enable it in settings.';
      } else if (error.code === 'NOT_SUPPORTED') {
        errorMessage = 'Speech recognition not supported on this device/browser.';
      } else if (error.code === 'NOT_IMPLEMENTED') {
        errorMessage = 'Native speech recognition requires additional setup. Use web version.';
      } else if (error.code === 'NO_SPEECH') {
        errorMessage = 'No speech detected. Please try again.';
      } else if (error.code === 'NETWORK') {
        errorMessage = 'Network error. Check your connection.';
      }
      
      setError(errorMessage);
      console.error('Voice recognition error:', error);
    }
  };

  const handleStop = () => {
    stopListening();
    setState('idle');
  };

  const getButtonLabel = () => {
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      default:
        return 'Start Listening';
    }
  };

  const getButtonIcon = () => {
    if (state === 'listening') {
      return 'microphone';
    } else if (state === 'processing') {
      return 'sync';
    }
    return 'microphone-outline';
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={state === 'listening' ? handleStop : handleVoiceInput}
          disabled={state === 'processing'}
          style={[
            styles.button,
            state === 'listening' && styles.listeningButton,
            state === 'processing' && styles.processingButton
          ]}
          icon={getButtonIcon()}
        >
          {state === 'processing' ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            getButtonLabel()
          )}
        </Button>
        
        {state === 'listening' && (
          <View style={styles.indicator}>
            <View style={styles.pulse} />
            <Text style={styles.indicatorText}>Speak now</Text>
          </View>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <TextInput
        label="Transcription"
        value={transcription}
        onChangeText={(text) => {
          setTranscription(text);
          onTranscription(text);
        }}
        style={styles.input}
        multiline
        numberOfLines={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
  listeningButton: {
    backgroundColor: '#e74c3c',
  },
  processingButton: {
    backgroundColor: '#95a5a6',
  },
  indicator: {
    marginTop: 12,
    alignItems: 'center',
  },
  pulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e74c3c',
    marginBottom: 8,
  },
  indicatorText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
});
