import { Camera } from 'expo-camera';
import { Accelerometer, Gyroscope } from 'expo-sensors';

export const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
};

export const requestMotionPermission = async () => {
  const accelerometerStatus = await Accelerometer.requestPermissionsAsync();
  const gyroscopeStatus = await Gyroscope.requestPermissionsAsync();
  return accelerometerStatus.status === 'granted' && gyroscopeStatus.status === 'granted';
};
