import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { router } from 'expo-router';

const SHAKE_THRESHOLD = 2.5; // g-force threshold for shake detection
const SHAKE_DURATION = 1000; // ms to consider a shake
const SHAKE_COUNT = 3; // number of shakes to trigger emergency

export function useShakeDetection() {
  const [isShaking, setIsShaking] = useState(false);
  const shakeCount = useRef(0);
  const lastShakeTime = useRef(0);
  const subscription = useRef<any>(null);

  const startShakeListener = () => {
    if (subscription.current) return;

    subscription.current = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
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

        // If we've detected enough shakes, trigger emergency
        if (shakeCount.current >= SHAKE_COUNT) {
          setIsShaking(true);
          router.push('/emergency');
          shakeCount.current = 0; // Reset counter
        }
      }
    });

    Accelerometer.setUpdateInterval(100); // Update every 100ms
  };

  const stopShakeListener = () => {
    if (subscription.current) {
      subscription.current.remove();
      subscription.current = null;
    }
  };

  return {
    isShaking,
    startShakeListener,
    stopShakeListener,
  };
}
