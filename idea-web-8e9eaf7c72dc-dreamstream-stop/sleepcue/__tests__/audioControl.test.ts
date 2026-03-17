import { AudioController } from '../services/audioControl';

jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    getStatusAsync: jest.fn().mockResolvedValue({
      isPlaying: true,
      positionMillis: 30000,
    }),
    setIsPlayingAsync: jest.fn().mockResolvedValue(undefined),
    setPositionAsync: jest.fn().mockResolvedValue(undefined),
    setVolumeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('AudioController', () => {
  let audioController: AudioController;

  beforeEach(() => {
    audioController = new AudioController();
    jest.clearAllMocks();
  });

  it('should initialize audio mode', async () => {
    await audioController.initialize();
    expect(require('expo-av').Audio.setAudioModeAsync).toHaveBeenCalled();
  });

  it('should detect external audio playing', async () => {
    const isPlaying = await audioController.detectExternalAudio();
    expect(isPlaying).toBe(true);
    expect(require('expo-av').Audio.getStatusAsync).toHaveBeenCalled();
  });

  it('should pause system audio', async () => {
    const success = await audioController.pauseSystemAudio();
    expect(success).toBe(true);
    expect(require('expo-av').Audio.setIsPlayingAsync).toHaveBeenCalledWith(false);
  });

  it('should resume system audio with rewind', async () => {
    await audioController.detectExternalAudio();
    const success = await audioController.resumeSystemAudio(5);
    expect(success).toBe(true);
    expect(require('expo-av').Audio.setPositionAsync).toHaveBeenCalled();
    expect(require('expo-av').Audio.setIsPlayingAsync).toHaveBeenCalledWith(true);
  });

  it('should fade out and pause', async () => {
    const success = await audioController.fadeOutAndPause(1000);
    expect(success).toBe(true);
    expect(require('expo-av').Audio.setIsPlayingAsync).toHaveBeenCalledWith(false);
  });

  it('should store last known position', async () => {
    await audioController.detectExternalAudio();
    const position = audioController.getLastKnownPosition();
    expect(position).toBe(30000);
  });
});
