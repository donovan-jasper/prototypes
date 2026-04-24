import { Accelerometer } from 'expo-sensors';

interface MotionData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
}

export const detectStillness = async (durationSeconds: number): Promise<boolean> => {
  return new Promise((resolve) => {
    let stillCount = 0;
    const requiredSamples = Math.floor(durationSeconds / 2); // 1 sample per 2 seconds
    let subscription: any;

    const checkStillness = (data: any) => {
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
    };

    // Start accelerometer
    Accelerometer.setUpdateInterval(1000); // 1 second interval
    subscription = Accelerometer.addListener(checkStillness);

    // Set timeout to prevent hanging
    setTimeout(() => {
      subscription.remove();
      resolve(false);
    }, durationSeconds * 1000);
  });
};
