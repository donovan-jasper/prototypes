import { useState, useEffect, useCallback } from 'react';
import { SleepDetector } from '../services/sleepDetection';
import { AudioController } from '../services/audioControl';
import { DatabaseService } from '../services/database';

interface SleepDetectionResult {
  isSleeping: boolean;
  confidence: number;
}

export function useSleepDetection() {
  const [isSleeping, setIsSleeping] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  const sleepDetector = new SleepDetector();
  const audioController = new AudioController();
  const database = new DatabaseService();

  const handleDetectionUpdate = useCallback((result: SleepDetectionResult) => {
    setIsSleeping(result.isSleeping);
    setConfidence(result.confidence);

    if (result.isSleeping) {
      // Pause audio when sleep is detected
      audioController.fadeOutAndPause();

      // Log sleep session to database
      const now = new Date();
      database.addSleepSession({
        startTime: now.toISOString(),
        endTime: now.toISOString(),
        duration: 0, // Will be updated when session ends
        confidence: result.confidence,
        batterySaved: 0, // Will be calculated based on duration
      });
    }
  }, []);

  const startDetection = useCallback(async () => {
    if (isDetecting) return;

    try {
      setIsDetecting(true);
      await sleepDetector.startDetection(handleDetectionUpdate);
    } catch (error) {
      console.error('Failed to start sleep detection:', error);
      setIsDetecting(false);
    }
  }, [isDetecting, handleDetectionUpdate]);

  const stopDetection = useCallback(() => {
    if (!isDetecting) return;

    sleepDetector.stopDetection();
    setIsDetecting(false);
    setIsSleeping(false);
    setConfidence(0);
  }, [isDetecting]);

  useEffect(() => {
    return () => {
      if (isDetecting) {
        stopDetection();
      }
    };
  }, [isDetecting, stopDetection]);

  return {
    isSleeping,
    confidence,
    isDetecting,
    startDetection,
    stopDetection,
  };
}
