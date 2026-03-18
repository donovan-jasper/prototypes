import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface VoiceRecognitionResult {
  transcription: string;
  confidence?: number;
}

export interface VoiceRecognitionError {
  code: string;
  message: string;
}

let recognition: any = null;

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
};

export const startListening = (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Request microphone permission first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        reject({
          code: 'PERMISSION_DENIED',
          message: 'Microphone permission not granted'
        } as VoiceRecognitionError);
        return;
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (Platform.OS === 'web') {
        // Web Speech API
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          reject({
            code: 'NOT_SUPPORTED',
            message: 'Speech recognition not supported in this browser'
          } as VoiceRecognitionError);
          return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };

        recognition.onerror = (event: any) => {
          reject({
            code: event.error.toUpperCase(),
            message: `Speech recognition error: ${event.error}`
          } as VoiceRecognitionError);
        };

        recognition.onend = () => {
          recognition = null;
        };

        recognition.start();
      } else {
        // For native platforms, use expo-speech's recognition if available
        // Note: expo-speech primarily handles TTS, not STT
        // For production, you'd integrate with native modules or cloud APIs
        
        // Fallback implementation using mock for now
        // In production, integrate with:
        // - iOS: Speech framework via native module
        // - Android: SpeechRecognizer via native module
        // - Or cloud APIs: Google Cloud Speech-to-Text, AWS Transcribe, etc.
        
        setTimeout(() => {
          reject({
            code: 'NOT_IMPLEMENTED',
            message: 'Native speech recognition requires additional native modules. Please use web version or integrate cloud STT service.'
          } as VoiceRecognitionError);
        }, 100);
      }
    } catch (error) {
      reject({
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      } as VoiceRecognitionError);
    }
  });
};

export const stopListening = () => {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
};

export const speak = (text: string) => {
  Speech.speak(text);
};
