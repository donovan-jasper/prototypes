import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

interface MotionData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export const useMotionDetector = () => {
  const [isStill, setIsStill] = useState(false);
  const [motionData, setMotionData] = useState<MotionData[]>([]);
  const [stillnessDuration, setStillnessDuration] = useState(0);

  useEffect(() => {
    let subscription: any;

    // Start accelerometer
    Accelerometer.setUpdateInterval(1000); // 1 second interval
    subscription = Accelerometer.addListener((data) => {
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      const newData = { ...data, magnitude, timestamp: Date.now() };

      setMotionData(prev => {
        const updatedData = [...prev, newData].slice(-120); // Keep last 2 minutes (120 samples)
        return updatedData;
      });
    });

    // Check for stillness every 2 minutes
    const interval = setInterval(() => {
      if (motionData.length >= 120) { // At least 2 minutes of data
        const recentData = motionData.slice(-120); // Last 2 minutes
        const avgMagnitude = recentData.reduce((sum, data) => sum + data.magnitude, 0) / recentData.length;

        if (avgMagnitude < 0.05) { // Threshold for stillness
          setStillnessDuration(prev => prev + 2); // Increment by 2 minutes
          if (stillnessDuration >= 10) {
            setIsStill(true);
          }
        } else {
          setStillnessDuration(0);
          setIsStill(false);
        }
      }
    }, 120000); // Check every 2 minutes

    return () => {
      if (subscription) {
        subscription.remove();
      }
      clearInterval(interval);
    };
  }, [motionData, stillnessDuration]);

  return { isStill, stillnessDuration };
};

export const detectStillness = async (durationSeconds: number): Promise<boolean> => {
  return new Promise((resolve) => {
    let stillCount = 0;
    const requiredSamples = Math.floor(durationSeconds / 2); // 1 sample per 2 seconds

    const subscription = Accelerometer.addListener((data) => {
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);

      if (magnitude < 0.05) { // Stillness threshold
        stillCount++;
      } else {
        stillCount = 0;
      }

      if (stillCount >= requiredSamples) {
        subscription.remove();
        resolve(true);
      }
    });

    // Set timeout to prevent hanging
    setTimeout(() => {
      subscription.remove();
      resolve(false);
    }, durationSeconds * 1000);
  });
};
