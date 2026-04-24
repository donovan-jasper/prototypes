import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  addSpeechRecognitionListener,
  removeSpeechRecognitionListener,
} from 'expo-speech-recognition';

export interface VoiceRecognitionResult {
  transcription: string;
  confidence?: number;
}

export interface VoiceRecognitionError {
  code: string;
  message: string;
}

let recognition: any = null;
let currentResolve: ((value: string) => void) | null = null;
let currentReject: ((error: VoiceRecognitionError) => void) | null = null;

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
        // Native platforms using expo-speech-recognition
        currentResolve = resolve;
        currentReject = reject;

        // Check if speech recognition is available
        const result = await ExpoSpeechRecognitionModule.getStateAsync();
        if (!result.isRecognitionAvailable) {
          reject({
            code: 'NOT_AVAILABLE',
            message: 'Speech recognition is not available on this device'
          } as VoiceRecognitionError);
          return;
        }

        // Request permissions
        const permissionResult = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!permissionResult.granted) {
          reject({
            code: 'PERMISSION_DENIED',
            message: 'Speech recognition permission not granted'
          } as VoiceRecognitionError);
          return;
        }

        // Add event listeners
        const resultListener = addSpeechRecognitionListener('result', (event) => {
          if (event.isFinal && event.results && event.results.length > 0) {
            const transcript = event.results[0]?.transcript || '';
            if (currentResolve) {
              currentResolve(transcript);
              currentResolve = null;
              currentReject = null;
            }
          }
        });

        const errorListener = addSpeechRecognitionListener('error', (event) => {
          if (currentReject) {
            currentReject({
              code: event.error || 'UNKNOWN_ERROR',
              message: event.message || 'Speech recognition error occurred'
            } as VoiceRecognitionError);
            currentResolve = null;
            currentReject = null;
          }
        });

        const endListener = addSpeechRecognitionListener('end', () => {
          removeSpeechRecognitionListener(resultListener);
          removeSpeechRecognitionListener(errorListener);
          removeSpeechRecognitionListener(endListener);

          if (currentReject) {
            currentReject({
              code: 'NO_SPEECH',
              message: 'No speech detected'
            } as VoiceRecognitionError);
            currentResolve = null;
            currentReject = null;
          }
        });

        // Start recognition
        await ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: false,
          maxAlternatives: 1,
          continuous: false,
          prompt: 'Speak now...'
        });
      }
    } catch (error) {
      reject({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred'
      } as VoiceRecognitionError);
    }
  });
};

export const stopListening = async (): Promise<void> => {
  if (Platform.OS === 'web' && recognition) {
    recognition.stop();
    recognition = null;
  } else if (Platform.OS !== 'web') {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
};

export const speak = async (text: string, options?: Speech.SpeechOptions): Promise<void> => {
  try {
    await Speech.speak(text, options);
  } catch (error) {
    console.error('Error speaking text:', error);
  }
};
