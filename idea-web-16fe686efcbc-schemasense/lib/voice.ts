import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { FileSystem } from 'expo-file-system';

interface VoiceResult {
  text: string;
  isFinal: boolean;
  error?: string;
}

export const useVoiceRecognition = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, setPermissionResponse] = useState<any>(null);
  const [transcription, setTranscription] = useState<VoiceResult>({ text: '', isFinal: false });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

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

      // Transcribe the audio
      const transcriptionResult = await transcribeAudio(uri);
      setTranscription(transcriptionResult);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setTranscription({ text: '', isFinal: false, error: 'Transcription failed' });

      // Fallback to offline patterns if API fails
      if (error instanceof Error && error.message.includes('Network')) {
        setIsOfflineMode(true);
        const offlineResult = await simulateOfflineTranscription();
        setTranscription(offlineResult);
      }
    } finally {
      setRecording(null);
    }
  };

  const transcribeAudio = async (uri: string): Promise<VoiceResult> => {
    try {
      // Read the audio file
      const audioData = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // In a real implementation, you would send this to OpenAI's Whisper API
      // This is a placeholder for the actual API call
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        body: JSON.stringify({
          file: audioData,
          model: 'whisper-1',
          language: 'en',
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      return {
        text: result.text,
        isFinal: true,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw error; // Re-throw to handle in stopRecording
    }
  };

  const simulateOfflineTranscription = async (): Promise<VoiceResult> => {
    // Simulate offline pattern matching
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would match against saved query patterns
    return {
      text: "Show me all customers with orders over $100",
      isFinal: true,
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
    isOfflineMode,
  };
};
