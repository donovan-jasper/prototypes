import { Linking, Platform } from 'react-native';
import * as SMS from 'expo-sms';
import { Accelerometer } from 'expo-sensors';

export const triggerEmergencyCall = async (phoneNumber) => {
  const url = `tel:${phoneNumber}`;
  await Linking.openURL(url);
};

export const sendEmergencySMS = async (phoneNumber, message) => {
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    await SMS.sendSMSAsync([phoneNumber], message);
  }
};

export const detectShakeGesture = (callback) => {
  let lastX = 0;
  let lastY = 0;
  let lastZ = 0;
  let shakeCount = 0;

  const subscription = Accelerometer.addListener(accelerometerData => {
    const { x, y, z } = accelerometerData;
    const deltaX = Math.abs(x - lastX);
    const deltaY = Math.abs(y - lastY);
    const deltaZ = Math.abs(z - lastZ);

    if (deltaX > 2.5 || deltaY > 2.5 || deltaZ > 2.5) {
      shakeCount++;
      if (shakeCount >= 3) {
        callback();
        shakeCount = 0;
      }
    }

    lastX = x;
    lastY = y;
    lastZ = z;
  });

  Accelerometer.setUpdateInterval(100);

  return subscription;
};
