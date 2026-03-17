import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import * as SpeechRecognition from 'expo-speech-recognition';

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await SpeechRecognition.requestPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access microphone was denied');
      }
    })();
  }, []);

  const startListening = async () => {
    setIsListening(true);
    try {
      await SpeechRecognition.startAsync({
        language: 'en-US',
        onRecognized: (result) => {
          setTranscript(result.text);
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
        },
      });
    } catch (error) {
      console.error('Speech recognition error:', error);
    } finally {
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await SpeechRecognition.stopAsync();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    } finally {
      setIsListening(false);
    }
  };

  return { isListening, transcript, startListening, stopListening };
};

export default useVoiceRecognition;
