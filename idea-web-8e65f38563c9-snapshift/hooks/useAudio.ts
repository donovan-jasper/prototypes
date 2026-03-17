import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<Audio.PlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async (audioFile: string) => {
    setIsLoading(true);
    setError(null);

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

      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        setPlaybackStatus(status);

        if (status.isLoaded) {
          // You can add additional status handling here if needed
        }
      });

      return newSound;
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to load audio file');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlaybackStatus(null);
    }
  };

  return {
    playAudio,
    pauseAudio,
    stopAudio,
    playbackStatus,
    isLoading,
    error,
  };
};
