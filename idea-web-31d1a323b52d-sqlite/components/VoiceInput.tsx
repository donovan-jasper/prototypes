import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, placeholder = 'Tap to speak...' }) => {
  const theme = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = async () => {
    try {
      setError(null);
      setIsListening(true);
      setTranscript('');

      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start speech recognition
      Speech.recognizeAsync({
        language: 'en-US',
        prompt: 'Speak now...',
        onResult: (result) => {
          if (result.isFinal) {
            setTranscript(result.text);
            onResult(result.text);
            setIsListening(false);
          }
        },
        onError: (error) => {
          setError(error.message);
          setIsListening(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start voice input');
      setIsListening(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.surfaceVariant },
          isListening && styles.listeningContainer
        ]}
        onPress={startListening}
        disabled={isListening}
      >
        {isListening ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <MaterialCommunityIcons
            name="microphone"
            size={24}
            color={theme.colors.primary}
          />
        )}
        <Text style={[
          styles.placeholder,
          { color: theme.colors.onSurfaceVariant }
        ]}>
          {transcript || placeholder}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  listeningContainer: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  placeholder: {
    marginLeft: 8,
    flex: 1,
  },
  errorText: {
    marginTop: 4,
    textAlign: 'center',
  },
});

export default VoiceInput;
