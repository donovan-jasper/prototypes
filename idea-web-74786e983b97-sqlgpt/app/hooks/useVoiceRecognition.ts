import { useState } from 'react';

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    setIsListening(true);
    // Simulate speech recognition
    setTimeout(() => {
      setTranscript('Show me sales last quarter');
      setIsListening(false);
    }, 1000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return { isListening, transcript, startListening, stopListening };
};

export default useVoiceRecognition;
