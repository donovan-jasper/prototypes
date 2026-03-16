import { AudioController } from '../services/audioControl';

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          pauseAsync: jest.fn(),
          setPositionAsync: jest.fn(),
          setVolumeAsync: jest.fn(),
          setOnPlaybackStatusUpdate: jest.fn(),
          unloadAsync: jest.fn(),
        },
      }),
    },
  },
}));

describe('AudioController', () => {
  let audioController: AudioController;

  beforeEach(() => {
    audioController = new AudioController();
  });

  it('should play audio', async () => {
    await audioController.play();
    expect(require('expo-av').Audio.Sound.createAsync).toHaveBeenCalled();
  });

  it('should pause audio', async () => {
    await audioController.play();
    await audioController.pause();
    expect(require('expo-av').Audio.Sound.createAsync().sound.pauseAsync).toHaveBeenCalled();
  });

  it('should rewind audio', async () => {
    await audioController.play();
    await audioController.rewind(5);
    expect(require('expo-av').Audio.Sound.createAsync().sound.setPositionAsync).toHaveBeenCalled();
  });

  it('should fade out and pause audio', async () => {
    await audioController.play();
    await audioController.fadeOutAndPause(1000);
    expect(require('expo-av').Audio.Sound.createAsync().sound.setVolumeAsync).toHaveBeenCalled();
    expect(require('expo-av').Audio.Sound.createAsync().sound.pauseAsync).toHaveBeenCalled();
  });
});
