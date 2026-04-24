import { useStore } from '@/lib/store/useStore';
import { getAudiobookById, updateProgress } from '@/lib/db/audiobooks';
import TrackPlayer, { Event, State, useTrackPlayerEvents } from 'react-native-track-player';
import { useEffect, useState } from 'react';
import { Audiobook, Chapter } from '@/lib/db/schema';

interface PlaybackState {
  currentAudiobook: Audiobook | null;
  currentChapter: Chapter | null;
  playbackState: State;
  position: number;
  duration: number;
  speed: number;
  isBuffering: boolean;
}

export const usePlayer = () => {
  const [state, setState] = useState<PlaybackState>({
    currentAudiobook: null,
    currentChapter: null,
    playbackState: State.None,
    position: 0,
    duration: 0,
    speed: 1.0,
    isBuffering: false,
  });

  const { setCurrentAudiobook } = useStore();

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackProgressUpdated], async (event) => {
    switch (event.type) {
      case Event.PlaybackState:
        const newState = event.state as State;
        setState(prev => ({ ...prev, playbackState: newState }));

        // If playback is stopped, save progress
        if (newState === State.Stopped && state.currentAudiobook) {
          const position = await TrackPlayer.getPosition();
          await updateProgress(state.currentAudiobook.id!, position);
        }
        break;

      case Event.PlaybackProgressUpdated:
        setState(prev => ({
          ...prev,
          position: event.position,
          duration: event.duration,
        }));

        // Update current chapter based on position
        if (state.currentAudiobook?.chapters) {
          const currentChapter = state.currentAudiobook.chapters.find(chapter =>
            event.position >= chapter.startTime && event.position <= chapter.endTime
          );
          if (currentChapter && currentChapter.id !== state.currentChapter?.id) {
            setState(prev => ({ ...prev, currentChapter }));
          }
        }
        break;
    }
  });

  const setupPlayer = async (audiobookId: number) => {
    try {
      const audiobook = await getAudiobookById(audiobookId);
      if (!audiobook) return;

      setCurrentAudiobook(audiobook);
      setState(prev => ({
        ...prev,
        currentAudiobook: audiobook,
        currentChapter: audiobook.chapters?.[0] || null,
        position: audiobook.currentPosition || 0,
      }));

      await TrackPlayer.setupPlayer();
      await TrackPlayer.reset();

      // Add the audiobook as a track
      await TrackPlayer.add({
        id: audiobook.id!.toString(),
        url: audiobook.filePath,
        title: audiobook.title,
        artist: audiobook.author,
        duration: audiobook.duration,
        artwork: audiobook.coverArt,
      });

      // Set initial position
      if (audiobook.currentPosition) {
        await TrackPlayer.seekTo(audiobook.currentPosition);
      }

      // Set initial speed
      await TrackPlayer.setRate(state.speed);
    } catch (error) {
      console.error('Error setting up player:', error);
    }
  };

  const play = async () => {
    await TrackPlayer.play();
  };

  const pause = async () => {
    await TrackPlayer.pause();
  };

  const seekTo = async (position: number) => {
    await TrackPlayer.seekTo(position);
  };

  const setPlaybackSpeed = async (speed: number) => {
    await TrackPlayer.setRate(speed);
    setState(prev => ({ ...prev, speed }));
  };

  const skipToChapter = async (chapterIndex: number) => {
    if (!state.currentAudiobook?.chapters) return;

    const chapter = state.currentAudiobook.chapters[chapterIndex];
    if (chapter) {
      await TrackPlayer.seekTo(chapter.startTime);
      setState(prev => ({ ...prev, currentChapter: chapter }));
    }
  };

  const skipForward = async (seconds: number = 15) => {
    const currentPosition = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(currentPosition + seconds);
  };

  const skipBackward = async (seconds: number = 15) => {
    const currentPosition = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(Math.max(0, currentPosition - seconds));
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  return {
    ...state,
    setupPlayer,
    play,
    pause,
    seekTo,
    setPlaybackSpeed,
    skipToChapter,
    skipForward,
    skipBackward,
    formatTime,
  };
};
