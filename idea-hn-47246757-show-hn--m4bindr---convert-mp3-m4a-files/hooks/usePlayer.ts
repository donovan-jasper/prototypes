import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { usePlayer } from '@/lib/player/playback';

export const usePlayerControls = () => {
  const {
    currentAudiobook,
    isPlaying,
    position,
    speed,
    setPlaybackState,
    setPosition,
  } = usePlayer();
  const [sound, setSound] = useState(null);

  useEffect(() => {
    if (currentAudiobook) {
      loadAudio();
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentAudiobook]);

  const loadAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: currentAudiobook.filePath },
      { positionMillis: position, rate: speed },
      onPlaybackStatusUpdate
    );
    setSound(newSound);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setPlaybackState(status.isPlaying);
    }
  };

  const playPause = async () => {
    if (!sound) {
      await loadAudio();
    }

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const skipForward = async () => {
    if (sound) {
      const newPosition = Math.min(position + 15000, currentAudiobook.duration);
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const skipBackward = async () => {
    if (sound) {
      const newPosition = Math.max(position - 15000, 0);
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const setPlaybackSpeed = async (newSpeed) => {
    if (sound) {
      await sound.setRateAsync(newSpeed, true);
    }
  };

  return {
    playPause,
    skipForward,
    skipBackward,
    setPlaybackSpeed,
  };
};
