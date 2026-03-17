import { useState, useEffect } from 'react';
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
    setTranscript(''); // Clear previous transcript
    try {
      await SpeechRecognition.startAsync({
        language: 'en-US',
        onRecognized: (result) => {
          setTranscript(prev => prev + ' ' + result.text);
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        },
      });
    } catch (error) {
      console.error('Speech recognition error:', error);
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
