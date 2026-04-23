import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';

interface VoiceResult {
  text: string;
  isFinal: boolean;
  error?: string;
}

export const useVoiceRecognition = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, setPermissionResponse] = useState<any>(null);
  const [transcription, setTranscription] = useState<VoiceResult>({ text: '', isFinal: false });

  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, [recording]);

  const checkPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setPermissionResponse(status);
      return status === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Please enable microphone access in settings');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setTranscription({ text: '', isFinal: false });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setTranscription({ text: '', isFinal: false, error: 'Recording failed' });
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (!uri) {
        throw new Error('No recording URI available');
      }

      // In a real app, you would send the audio file to a transcription service here
      // For this prototype, we'll simulate transcription
      const simulatedTranscription = await simulateTranscription(uri);
      setTranscription(simulatedTranscription);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setTranscription({ text: '', isFinal: false, error: 'Transcription failed' });
    } finally {
      setRecording(null);
    }
  };

  const simulateTranscription = async (uri: string): Promise<VoiceResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, this would be the actual transcription result
    return {
      text: "Show me all customers with orders over $100",
      isFinal: true
    };
  };

  const speak = (text: string) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.0,
    });
  };

  return {
    recording,
    transcription,
    startRecording,
    stopRecording,
    speak,
    isRecording: !!recording,
  };
};
