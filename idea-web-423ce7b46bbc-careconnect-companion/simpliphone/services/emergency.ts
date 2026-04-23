import { Linking, Platform } from 'react-native';
import * as SMS from 'expo-sms';
import { Accelerometer } from 'expo-sensors';

export const triggerEmergencyCall = async (phoneNumber: string) => {
  const url = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
  await Linking.openURL(url);
};

export const sendEmergencySMS = async (phoneNumber: string, message: string) => {
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    await SMS.sendSMSAsync([phoneNumber], message);
  } else {
    throw new Error('SMS is not available on this device');
  }
};

export const detectShakeGesture = (callback: () => void) => {
  let lastX = 0;
  let lastY = 0;
  let lastZ = 0;
  let shakeCount = 0;
  const shakeThreshold = 2.5;
  const shakeTimeout = 1000; // 1 second window for shakes
  let lastShakeTime = 0;

  const subscription = Accelerometer.addListener(accelerometerData => {
    const { x, y, z } = accelerometerData;
    const deltaX = Math.abs(x - lastX);
    const deltaY = Math.abs(y - lastY);
    const deltaZ = Math.abs(z - lastZ);

    const currentTime = Date.now();

    if (deltaX > shakeThreshold || deltaY > shakeThreshold || deltaZ > shakeThreshold) {
      if (currentTime - lastShakeTime < shakeTimeout) {
        shakeCount++;
        if (shakeCount >= 3) {
          callback();
          shakeCount = 0;
        }
      } else {
        shakeCount = 1;
      }
      lastShakeTime = currentTime;
    }

    lastX = x;
    lastY = y;
    lastZ = z;
  });

  Accelerometer.setUpdateInterval(100);

  return subscription;
};
