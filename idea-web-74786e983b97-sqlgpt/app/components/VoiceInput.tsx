import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

interface VoiceInputProps {
  onSpeechResults: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onSpeechResults }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const stopPulseAnimation = () => {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    };

    if (isListening) {
      try {
        Speech.recognizeAsync({
          language: 'en-US',
          prompt: 'Speak your query',
          onRecognized: (result) => {
            const text = result.text;
            setTranscript(text);
            onSpeechResults(text);
            setIsListening(false);
          },
          onError: (error) => {
            setError(error.message);
            setIsListening(false);
          },
        });
        startPulseAnimation();
      } catch (err) {
        setError('Failed to start speech recognition');
        setIsListening(false);
      }
    } else {
      stopPulseAnimation();
    }

    return () => {
      stopPulseAnimation();
    };
  }, [isListening, onSpeechResults, pulseAnim]);

  const toggleListening = () => {
    setIsListening(!isListening);
    setError(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="mic-button"
        style={[
          styles.micButton,
          isListening && styles.micButtonActive,
        ]}
        onPress={toggleListening}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons
            name={isListening ? 'mic' : 'mic-outline'}
            size={32}
            color={isListening ? '#FF3B30' : '#007AFF'}
          />
        </Animated.View>
      </TouchableOpacity>

      {isListening && (
        <Text style={styles.statusText}>Listening...</Text>
      )}

      {transcript ? (
        <Text style={styles.transcript}>Recognized: {transcript}</Text>
      ) : null}

      {error && (
        <Text style={styles.errorText}>Error: {error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  micButtonActive: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  transcript: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FF3B30',
  },
});

export default VoiceInput;
