import { Audio } from 'expo-av';

let backgroundSound: Audio.Sound | null = null;

export const setupBackgroundAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
  } catch (error) {
    console.log('Failed to set audio mode', error);
  }
};

export const playBackgroundSound = async () => {
  try {
    if (backgroundSound) {
      await backgroundSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/ambient.mp3'),
      {
        isLooping: true,
        volume: 0.3,
      }
    );

    backgroundSound = sound;
    await sound.playAsync();
  } catch (error) {
    console.log('Failed to play background sound', error);
  }
};

export const stopBackgroundSound = async () => {
  if (backgroundSound) {
    await backgroundSound.stopAsync();
    await backgroundSound.unloadAsync();
    backgroundSound = null;
  }
};
