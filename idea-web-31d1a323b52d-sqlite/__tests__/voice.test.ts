import { requestMicrophonePermission, startListening, stopListening } from '../lib/voice';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Voice recognition', () => {
  it('requests microphone permission', async () => {
    const hasPermission = await requestMicrophonePermission();
    expect(hasPermission).toBe(true);
  });

  it('handles permission denial', async () => {
    const { Audio } = require('expo-av');
    Audio.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    
    const hasPermission = await requestMicrophonePermission();
    expect(hasPermission).toBe(false);
  });

  it('stops listening when called', () => {
    expect(() => stopListening()).not.toThrow();
  });
});
