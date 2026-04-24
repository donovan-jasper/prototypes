import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

interface MotionData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export const useMotionDetector = () => {
  const [motionData, setMotionData] = useState<MotionData[]>([]);
  const [isStill, setIsStill] = useState(false);

  useEffect(() => {
    let subscription: any;

    const startMotionDetection = async () => {
      subscription = Accelerometer.addListener((data) => {
        const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
        const newData = {
          x: data.x,
          y: data.y,
          z: data.z,
          timestamp: Date.now(),
        };

        setMotionData(prev => [...prev, newData].slice(-120)); // Keep last 2 minutes of data (1 sample per second)

        // Check if stillness is detected
        if (prev.length >= 120) { // 120 samples = 2 minutes
          const avgMagnitude = prev.reduce((sum, item) => {
            const itemMagnitude = Math.sqrt(item.x * item.x + item.y * item.y + item.z * item.z);
            return sum + itemMagnitude;
          }, 0) / prev.length;

          setIsStill(avgMagnitude < 0.05); // Threshold for stillness
        }
      });

      Accelerometer.setUpdateInterval(1000); // Update every second
    };

    startMotionDetection();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { motionData, isStill };
};

export const detectStillness = async (durationSeconds: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stillnessCount = 0;
    let subscription: any;

    subscription = Accelerometer.addListener((data) => {
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);

      if (magnitude < 0.05) {
        stillnessCount++;
      } else {
        stillnessCount = 0;
      }

      const elapsedSeconds = (Date.now() - startTime) / 1000;
      if (elapsedSeconds >= durationSeconds) {
        subscription.remove();
        resolve(stillnessCount >= durationSeconds); // Need continuous stillness for full duration
      }
    });

    Accelerometer.setUpdateInterval(1000);
  });
};
