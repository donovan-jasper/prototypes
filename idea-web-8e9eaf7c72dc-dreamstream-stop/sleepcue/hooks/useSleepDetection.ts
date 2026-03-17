import { useState, useEffect, useCallback, useRef } from 'react';
import { SleepDetector } from '../services/sleepDetection';
import { AudioController } from '../services/audioControl';
import { DatabaseService } from '../services/database';
import { Audio } from 'expo-av';

interface SleepDetectionResult {
  isSleeping: boolean;
  confidence: number;
}

export function useSleepDetection() {
  const [isSleeping, setIsSleeping] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  const sleepDetectorRef = useRef<SleepDetector | null>(null);
  const audioControllerRef = useRef<AudioController | null>(null);
  const databaseRef = useRef<DatabaseService | null>(null);

  useEffect(() => {
    sleepDetectorRef.current = new SleepDetector();
    audioControllerRef.current = new AudioController();
    databaseRef.current = new DatabaseService();

    return () => {
      if (sleepDetectorRef.current && isDetecting) {
        sleepDetectorRef.current.stopDetection();
      }
    };
  }, []);

  const handleDetectionUpdate = useCallback((result: SleepDetectionResult) => {
    setIsSleeping(result.isSleeping);
    setConfidence(result.confidence);

    if (result.isSleeping && databaseRef.current) {
      // Log sleep session to database
      const now = new Date();
      databaseRef.current.addSleepSession({
        startTime: now.toISOString(),
        endTime: now.toISOString(),
        duration: 0,
        confidence: result.confidence,
        batterySaved: 0,
      }).catch(err => {
        console.error('Failed to log sleep session:', err);
      });
    }
  }, []);

  const startDetection = useCallback(async () => {
    if (isDetecting || !sleepDetectorRef.current || !audioControllerRef.current) return;

    try {
      // Set up audio mode to control system playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      setIsDetecting(true);
      await sleepDetectorRef.current.startDetection(
        handleDetectionUpdate,
        audioControllerRef.current
      );
    } catch (error) {
      console.error('Failed to start sleep detection:', error);
      setIsDetecting(false);
    }
  }, [isDetecting, handleDetectionUpdate]);

  const stopDetection = useCallback(() => {
    if (!isDetecting || !sleepDetectorRef.current) return;

    sleepDetectorRef.current.stopDetection();
    setIsDetecting(false);
    setIsSleeping(false);
    setConfidence(0);
  }, [isDetecting]);

  return {
    isSleeping,
    confidence,
    isDetecting,
    startDetection,
    stopDetection,
  };
}
