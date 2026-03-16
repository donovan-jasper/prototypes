import { Accelerometer, Gyroscope } from 'expo-sensors';

export const subscribeToAccelerometer = (callback) => {
  Accelerometer.setUpdateInterval(100);
  return Accelerometer.addListener(callback);
};

export const subscribeToGyroscope = (callback) => {
  Gyroscope.setUpdateInterval(100);
  return Gyroscope.addListener(callback);
};

export const detectMotionPattern = (data, pattern) => {
  // Implement motion pattern detection logic
  return false;
};
