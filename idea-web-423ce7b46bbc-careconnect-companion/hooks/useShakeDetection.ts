import { useCallback, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { router } from 'expo-router';

const SHAKE_THRESHOLD = 2.5; // g-force threshold for shake detection
const SHAKE_DURATION = 1000; // ms to consider a shake
const SHAKE_COUNT = 3; // number of shakes required

export function useShakeDetection() {
  const shakeCount = useRef(0);
  const lastShakeTime = useRef(0);
  const subscription = useRef<any>(null);

  const handleShake = useCallback((data: { x: number; y: number; z: number }) => {
    const { x, y, z } = data;
    const acceleration = Math.sqrt(x * x + y * y + z * z);

    if (acceleration > SHAKE_THRESHOLD) {
      const now = Date.now();

      // Check if this is a new shake (not part of the same motion)
      if (now - lastShakeTime.current > SHAKE_DURATION) {
        shakeCount.current = 1;
      } else {
        shakeCount.current++;
      }

      lastShakeTime.current = now;

      // Check if we've reached the required number of shakes
      if (shakeCount.current >= SHAKE_COUNT) {
        // Reset shake count
        shakeCount.current = 0;

        // Navigate to emergency screen
        router.push('/emergency');
      }
    }
  }, []);

  const startShakeListener = useCallback(() => {
    // Clean up any existing subscription
    if (subscription.current) {
      subscription.current.remove();
    }

    // Request permission and start listening
    Accelerometer.isAvailableAsync().then((available) => {
      if (available) {
        Accelerometer.setUpdateInterval(100); // Update every 100ms
        subscription.current = Accelerometer.addListener(handleShake);
      }
    });
  }, [handleShake]);

  const stopShakeListener = useCallback(() => {
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopShakeListener();
    };
  }, [stopShakeListener]);

  return { startShakeListener, stopShakeListener };
}
