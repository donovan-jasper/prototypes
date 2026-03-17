import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;

export const playVoiceClip = async (audioFile: string) => {
  try {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      require(`../assets/voices/${audioFile}`),
      {
        shouldPlay: true,
        progressUpdateIntervalMillis: 500,
      }
    );

    sound = newSound;

    // Set up playback status updates
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        // You can add additional status handling here if needed
      }
    });

    await sound.playAsync();
    return sound;
  } catch (error) {
    console.error('Error playing audio:', error);
    throw error;
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

export const cleanupAudio = async () => {
  if (sound) {
    await sound.unloadAsync();
    sound = null;
  }
};
