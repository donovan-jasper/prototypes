import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
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
        title={isListening ? 'Listening...' : 'Start Listening'}
        onPress={startListening}
        disabled={isListening}
        color="#007AFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
});

export default VoiceInput;
