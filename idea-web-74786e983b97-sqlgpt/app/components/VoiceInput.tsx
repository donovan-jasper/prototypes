import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import useVoiceRecognition from '../hooks/useVoiceRecognition';

interface VoiceInputProps {
  onSpeechResults: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onSpeechResults }) => {
  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition();

  React.useEffect(() => {
    if (transcript) {
      onSpeechResults(transcript);
    }
  }, [transcript, onSpeechResults]);

  return (
    <View style={styles.container}>
      <Button
        title={isListening ? 'Stop Listening' : 'Start Listening'}
        onPress={isListening ? stopListening : startListening}
        color={isListening ? '#FF3B30' : '#007AFF'}
      />
      {transcript ? (
        <Text style={styles.transcript}>Recognized: {transcript}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  transcript: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
  },
});

export default VoiceInput;
