import { useState, useEffect, useCallback } from 'react';
import { sleepDetector } from '../services/sleepDetection';
import { useAudioPlayback } from './useAudioPlayback';

interface SleepDetectionState {
  isSleeping: boolean;
  confidence: number;
  lastUpdated: Date;
  isDetecting: boolean;
  error: string | null;
}

export const useSleepDetection = () => {
  const [state, setState] = useState<SleepDetectionState>({
    isSleeping: false,
    confidence: 0,
    lastUpdated: new Date(),
    isDetecting: false,
    error: null,
  });

  const { pausePlayback, resumePlayback } = useAudioPlayback();

  const updateState = useCallback(() => {
    const currentState = sleepDetector.getCurrentState();
    setState(prev => ({
      ...prev,
      isSleeping: currentState.isSleeping,
      confidence: currentState.confidence,
      lastUpdated: currentState.lastUpdated,
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(updateState, 1000);
    return () => clearInterval(interval);
  }, [updateState]);

  const startDetection = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null, isDetecting: true }));
      await sleepDetector.startDetection();
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to start sleep detection',
        isDetecting: false,
      }));
    }
  }, []);

  const stopDetection = useCallback(async () => {
    try {
      await sleepDetector.stopDetection();
      setState(prev => ({ ...prev, isDetecting: false }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to stop sleep detection',
      }));
    }
  }, []);

  // Auto-pause/resume playback when sleep state changes
  useEffect(() => {
    if (state.isSleeping) {
      pausePlayback();
    } else if (!state.isSleeping && state.isDetecting) {
      resumePlayback();
    }
  }, [state.isSleeping, state.isDetecting, pausePlayback, resumePlayback]);

  return {
    ...state,
    startDetection,
    stopDetection,
  };
};
