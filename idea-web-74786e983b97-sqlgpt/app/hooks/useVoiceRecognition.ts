import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = () => {
    setIsListening(true);
    setError(null);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  useEffect(() => {
    let recognition: Speech.SpeechRecognition | null = null;

    if (isListening) {
      try {
        recognition = Speech.startListening({
          onRecognized: (result) => {
            setTranscript(result.text);
          },
          onError: (error) => {
            setError(error.message);
            setIsListening(false);
          },
        });
      } catch (err) {
        setError('Failed to start speech recognition');
        setIsListening(false);
      }
    }

    return () => {
      if (recognition) {
        Speech.stopListening(recognition);
      }
    };
  }, [isListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
  };
};

export default useVoiceRecognition;
