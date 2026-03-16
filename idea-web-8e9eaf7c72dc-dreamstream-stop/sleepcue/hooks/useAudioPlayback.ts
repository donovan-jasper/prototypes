import { useState, useEffect, useCallback } from 'react';
import { AudioController } from '../services/audioControl';

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioController = new AudioController();

  const handlePlaybackStatusUpdate = useCallback((status: Audio.AudioPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
    }
  }, []);

  const play = useCallback(async () => {
    try {
      await audioController.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      await audioController.pause();
    } catch (error) {
      console.error('Failed to pause audio:', error);
    }
  }, []);

  const rewind = useCallback(async (seconds: number) => {
    try {
      await audioController.rewind(seconds);
    } catch (error) {
      console.error('Failed to rewind audio:', error);
    }
  }, []);

  const fadeOutAndPause = useCallback(async (duration: number = 3000) => {
    try {
      await audioController.fadeOutAndPause(duration);
    } catch (error) {
      console.error('Failed to fade out and pause audio:', error);
    }
  }, []);

  useEffect(() => {
    audioController.setOnPlaybackStatusUpdate(handlePlaybackStatusUpdate);

    return () => {
      // Clean up
      audioController.setOnPlaybackStatusUpdate(null);
    };
  }, [handlePlaybackStatusUpdate]);

  return {
    isPlaying,
    position,
    duration,
    play,
    pause,
    rewind,
    fadeOutAndPause,
  };
}
