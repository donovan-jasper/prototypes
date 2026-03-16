import { Accelerometer } from 'expo-sensors';

export const detectStillness = async (duration = 120) => {
  return new Promise((resolve) => {
    let movementData = [];
    let subscription = null;

    const handleMotion = ({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      movementData.push(magnitude);

      if (movementData.length >= duration * 10) { // 10 samples per second
        const avgMovement = movementData.reduce((sum, val) => sum + val, 0) / movementData.length;
        subscription.remove();
        resolve(avgMovement < 0.05); // Threshold for stillness
      }
    };

    subscription = Accelerometer.addListener(handleMotion);
    Accelerometer.setUpdateInterval(100); // 100ms interval
  });
};
