import { useState, useEffect, useRef } from 'react';
import { SleepDetector } from '../services/sleepDetection';
import { AudioController } from '../services/audioControl';
import { BackgroundTaskService } from '../services/backgroundTask';
import { AppState, AppStateStatus } from 'react-native';

interface SleepDetectionState {
  isSleeping: boolean;
  confidence: number;
  motionConfidence: number;
  audioConfidence: number;
  isDetecting: boolean;
  error: string | null;
}

export function useSleepDetection(
  confidenceThreshold: number = 0.7,
  fadeDuration: number = 3000,
  rewindAmount: number = 120
) {
  const [state, setState] = useState<SleepDetectionState>({
    isSleeping: false,
    confidence: 0,
    motionConfidence: 0,
    audioConfidence: 0,
    isDetecting: false,
    error: null,
  });

  const sleepDetectorRef = useRef<SleepDetector | null>(null);
  const audioControllerRef = useRef<AudioController | null>(null);
  const backgroundTaskRef = useRef<BackgroundTaskService | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Initialize services
    sleepDetectorRef.current = new SleepDetector(confidenceThreshold);
    audioControllerRef.current = new AudioController(fadeDuration, rewindAmount);
    backgroundTaskRef.current = new BackgroundTaskService();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      stopDetection();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      // Reinitialize detection when app comes to foreground
      if (state.isDetecting) {
        startDetection();
      }
    } else if (nextAppState.match(/inactive|background/)) {
      console.log('App has gone to the background!');
      // Register background task when app goes to background
      if (state.isDetecting && backgroundTaskRef.current) {
        backgroundTaskRef.current.registerBackgroundTask();
      }
    }

    appState.current = nextAppState;
  };

  const startDetection = async () => {
    try {
      if (!sleepDetectorRef.current || !audioControllerRef.current) {
        throw new Error('Sleep detection services not initialized');
      }

      // Stop any existing detection
      await stopDetection();

      // Start new detection
      await sleepDetectorRef.current.startDetection(
        (result) => {
          setState(prev => ({
            ...prev,
            isSleeping: result.isSleeping,
            confidence: result.confidence,
            motionConfidence: result.motionConfidence,
            audioConfidence: result.audioConfidence,
          }));
        },
        audioControllerRef.current
      );

      setState(prev => ({
        ...prev,
        isDetecting: true,
        error: null,
      }));

      // Register background task if app is in background
      if (appState.current.match(/inactive|background/) && backgroundTaskRef.current) {
        await backgroundTaskRef.current.registerBackgroundTask();
      }
    } catch (error) {
      console.error('Failed to start sleep detection:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start sleep detection',
      }));
    }
  };

  const stopDetection = async () => {
    try {
      if (sleepDetectorRef.current) {
        await sleepDetectorRef.current.stopDetection();
      }

      if (backgroundTaskRef.current) {
        await backgroundTaskRef.current.unregisterBackgroundTask();
      }

      setState(prev => ({
        ...prev,
        isDetecting: false,
        isSleeping: false,
        confidence: 0,
        motionConfidence: 0,
        audioConfidence: 0,
      }));
    } catch (error) {
      console.error('Failed to stop sleep detection:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop sleep detection',
      }));
    }
  };

  const resumeAudio = async () => {
    try {
      if (audioControllerRef.current) {
        await audioControllerRef.current.resumeSystemAudio();
        setState(prev => ({
          ...prev,
          isSleeping: false,
        }));
      }
    } catch (error) {
      console.error('Failed to resume audio:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to resume audio',
      }));
    }
  };

  const updateConfidenceThreshold = (threshold: number) => {
    if (sleepDetectorRef.current) {
      sleepDetectorRef.current.setConfidenceThreshold(threshold);
    }
  };

  const updateFadeDuration = (duration: number) => {
    if (audioControllerRef.current) {
      audioControllerRef.current.setFadeDuration(duration);
    }
  };

  const updateRewindAmount = (seconds: number) => {
    if (audioControllerRef.current) {
      audioControllerRef.current.setRewindAmount(seconds);
    }
  };

  return {
    ...state,
    startDetection,
    stopDetection,
    resumeAudio,
    updateConfidenceThreshold,
    updateFadeDuration,
    updateRewindAmount,
  };
}
