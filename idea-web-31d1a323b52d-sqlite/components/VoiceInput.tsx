import React, { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
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
  const [pulseAnim] = useState(new Animated.Value(1));

  React.useEffect(() => {
    if (state === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state]);

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
      } else if (error.code === 'NOT_SUPPORTED' || error.code === 'NOT_AVAILABLE') {
        errorMessage = 'Speech recognition not supported on this device.';
      } else if (error.code === 'NO_SPEECH') {
        errorMessage = 'No speech detected. Please try again.';
      } else if (error.code === 'NETWORK') {
        errorMessage = 'Network error. Check your connection.';
      } else if (error.code === 'AUDIO') {
        errorMessage = 'Audio recording error. Check microphone access.';
      }
      
      setError(errorMessage);
      console.error('Voice recognition error:', error);
    }
  };

  const handleStop = async () => {
    await stopListening();
    setState('idle');
  };

  const getButtonLabel = () => {
    switch (state) {
      case 'listening':
        return 'Tap to Stop';
      case 'processing':
        return 'Processing...';
      default:
        return 'Start Recording';
    }
  };

  const getButtonIcon = () => {
    if (state === 'listening') {
      return 'stop';
    } else if (state === 'processing') {
      return 'sync';
    }
    return 'microphone';
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
          contentStyle={styles.buttonContent}
        >
          {state === 'processing' ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            getButtonLabel()
          )}
        </Button>
        
        {state === 'listening' && (
          <View style={styles.indicator}>
            <Animated.View 
              style={[
                styles.pulse,
                { transform: [{ scale: pulseAnim }] }
              ]} 
            />
            <Text style={styles.indicatorText}>Listening... Speak now</Text>
          </View>
        )}
        
        {state === 'processing' && (
          <View style={styles.indicator}>
            <Text style={styles.indicatorText}>Converting speech to text...</Text>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
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
        mode="outlined"
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
  buttonContent: {
    paddingVertical: 8,
  },
  listeningButton: {
    backgroundColor: '#e74c3c',
  },
  processingButton: {
    backgroundColor: '#95a5a6',
  },
  indicator: {
    marginTop: 16,
    alignItems: 'center',
  },
  pulse: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    marginBottom: 8,
  },
  indicatorText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
});
