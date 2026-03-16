import { Accelerometer, Gyroscope } from 'expo-sensors';

export const analyzeMotion = (callback) => {
  let lastAcceleration = { x: 0, y: 0, z: 0 };
  let lastRotation = { x: 0, y: 0, z: 0 };
  let throwDetected = false;

  const accelerometerSubscription = Accelerometer.addListener((accelerometerData) => {
    const { x, y, z } = accelerometerData;
    const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);

    if (accelerationMagnitude > 2.0 && !throwDetected) {
      throwDetected = true;
      const speed = calculateSpeed(lastAcceleration, accelerometerData);
      const angle = calculateAngle(lastRotation);
      callback({ speed, angle, hit: false }); // Placeholder, implement hit detection
    }

    lastAcceleration = accelerometerData;
  });

  const gyroscopeSubscription = Gyroscope.addListener((gyroscopeData) => {
    lastRotation = gyroscopeData;
  });

  return {
    remove: () => {
      accelerometerSubscription.remove();
      gyroscopeSubscription.remove();
    },
  };
};

const calculateSpeed = (lastAcceleration, currentAcceleration) => {
  // Placeholder, implement actual speed calculation
  return Math.random() * 10;
};

const calculateAngle = (rotation) => {
  // Placeholder, implement actual angle calculation
  return Math.random() * 90;
};
