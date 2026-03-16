import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;

export const playVoiceClip = async (audioFile: string) => {
  try {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      require(`../assets/voices/${audioFile}`),
      { shouldPlay: true }
    );
    sound = newSound;

    await sound.playAsync();
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

export const pauseAudio = async () => {
  if (sound) {
    await sound.pauseAsync();
  }
};

export const stopAudio = async () => {
  if (sound) {
    await sound.stopAsync();
    await sound.unloadAsync();
    sound = null;
  }
};

export const getPlaybackStatus = async () => {
  if (sound) {
    return await sound.getStatusAsync();
  }
  return null;
};
