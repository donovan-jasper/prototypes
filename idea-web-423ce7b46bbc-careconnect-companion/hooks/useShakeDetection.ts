import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { router } from 'expo-router';
import { AppState, AppStateStatus } from 'react-native';

const SHAKE_THRESHOLD = 2.5; // g-force threshold for shake detection
const SHAKE_COUNT = 3; // Number of shakes needed to trigger emergency
const SHAKE_WINDOW_MS = 1000; // Time window between shakes (ms)

export function useShakeDetection() {
  const [isListening, setIsListening] = useState(false);
  const shakeCount = useRef(0);
  const lastShakeTime = useRef(0);
  const subscription = useRef<any>(null);

  const handleShake = () => {
    const now = Date.now();

    // Check if shake is within the time window
    if (now - lastShakeTime.current > SHAKE_WINDOW_MS) {
      shakeCount.current = 0;
    }

    shakeCount.current++;
    lastShakeTime.current = now;

    // Trigger emergency mode after 3 shakes
    if (shakeCount.current >= SHAKE_COUNT) {
      shakeCount.current = 0;
      router.push('/emergency');
    }
  };

  const startShakeListener = () => {
    if (isListening) return;

    subscription.current = Accelerometer.addListener((data) => {
      // Calculate magnitude of acceleration vector
      const magnitude = Math.sqrt(
        data.x * data.x + data.y * data.y + data.z * data.z
      );

      // Detect shake when magnitude exceeds threshold
      if (magnitude > SHAKE_THRESHOLD) {
        handleShake();
      }
    });

    Accelerometer.setUpdateInterval(100); // Update every 100ms
    setIsListening(true);
  };

  const stopShakeListener = () => {
    if (!isListening) return;

    subscription.current?.remove();
    setIsListening(false);
  };

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        startShakeListener();
      } else {
        stopShakeListener();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    startShakeListener,
    stopShakeListener,
    isListening,
  };
}
