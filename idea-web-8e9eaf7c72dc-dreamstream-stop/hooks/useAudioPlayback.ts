import { useState, useEffect, useCallback } from 'react';
import { audioController } from '../services/audioControl';
import { db } from '../services/database';

interface AudioPlaybackState {
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  rewindAmount: number;
  fadeDuration: number;
}

export const useAudioPlayback = () => {
  const [state, setState] = useState<AudioPlaybackState>({
    isPlaying: false,
    position: 0,
    duration: 0,
    volume: 1,
    rewindAmount: 2,
    fadeDuration: 3,
  });

  useEffect(() => {
    // Load user settings from database
    const loadSettings = async () => {
      try {
        await db.transactionAsync(async (tx) => {
          const result = await tx.executeSqlAsync('SELECT * FROM user_settings WHERE id = 1');
          if (result.rows.length > 0) {
            const settings = result.rows.item(0);
            setState(prev => ({
              ...prev,
              rewindAmount: settings.rewind_amount,
              fadeDuration: settings.fade_duration,
            }));
          }
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const pausePlayback = useCallback(async () => {
    try {
      await audioController.pausePlayback(state.fadeDuration);
      setState(prev => ({ ...prev, isPlaying: false }));
    } catch (error) {
      console.error('Failed to pause playback:', error);
    }
  }, [state.fadeDuration]);

  const resumePlayback = useCallback(async () => {
    try {
      await audioController.resumePlayback(state.rewindAmount);
      setState(prev => ({ ...prev, isPlaying: true }));
    } catch (error) {
      console.error('Failed to resume playback:', error);
    }
  }, [state.rewindAmount]);

  const setRewindAmount = useCallback(async (amount: number) => {
    try {
      await db.transactionAsync(async (tx) => {
        await tx.executeSqlAsync(
          'UPDATE user_settings SET rewind_amount = ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1',
          [amount]
        );
      });
      setState(prev => ({ ...prev, rewindAmount: amount }));
    } catch (error) {
      console.error('Failed to update rewind amount:', error);
    }
  }, []);

  const setFadeDuration = useCallback(async (duration: number) => {
    try {
      await db.transactionAsync(async (tx) => {
        await tx.executeSqlAsync(
          'UPDATE user_settings SET fade_duration = ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1',
          [duration]
        );
      });
      setState(prev => ({ ...prev, fadeDuration: duration }));
    } catch (error) {
      console.error('Failed to update fade duration:', error);
    }
  }, []);

  return {
    ...state,
    pausePlayback,
    resumePlayback,
    setRewindAmount,
    setFadeDuration,
  };
};
