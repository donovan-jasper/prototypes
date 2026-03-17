import * as Speech from 'expo-speech';
import { VoicePacks } from '../constants/VoicePacks';

export const generateCoachingMessage = (
  phase: 'start' | 'midpoint' | 'end',
  duration: number,
  packName: string
): string => {
  const pack = VoicePacks.find((p) => p.name === packName) || VoicePacks[0];

  switch (phase) {
    case 'start':
      return pack.messages.start.replace('{duration}', duration.toString());
    case 'midpoint':
      return pack.messages.midpoint;
    case 'end':
      return pack.messages.end;
    default:
      return '';
  }
};

export const speakMessage = async (text: string, packName: string): Promise<void> => {
  const pack = VoicePacks.find((p) => p.name === packName) || VoicePacks[0];

  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: pack.pitch,
      rate: pack.rate,
      onDone: () => resolve(),
      onError: (error) => reject(error),
    });
  });
};
