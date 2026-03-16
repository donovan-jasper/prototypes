import React, { useState } from 'react';
import { View, Button } from 'react-native';

interface VoiceInputProps {
  onSpeechResults: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onSpeechResults }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    setIsListening(true);
    // Simulate speech recognition
    setTimeout(() => {
      onSpeechResults('Show me sales last quarter');
      setIsListening(false);
    }, 1000);
  };

  return (
    <View>
      <Button
        title={isListening ? 'Listening...' : 'Start Listening'}
        onPress={startListening}
        disabled={isListening}
      />
    </View>
  );
};

export default VoiceInput;
