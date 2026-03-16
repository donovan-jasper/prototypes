import * as AppleHealthKit from 'expo-apple-healthkit';
import { Platform } from 'react-native';

export const syncSteps = async (date) => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Health is only available on iOS');
  }

  const permissions = {
    permissions: {
      read: [AppleHealthKit.Permissions.Steps],
    },
  };

  const isAvailable = await AppleHealthKit.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Apple Health is not available');
  }

  await AppleHealthKit.initHealthKit(permissions);

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const steps = await AppleHealthKit.getStepCountAsync(startDate, endDate);
  return steps.value;
};

export const syncSleep = async (date) => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Health is only available on iOS');
  }

  const permissions = {
    permissions: {
      read: [AppleHealthKit.Permissions.SleepAnalysis],
    },
  };

  const isAvailable = await AppleHealthKit.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Apple Health is not available');
  }

  await AppleHealthKit.initHealthKit(permissions);

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const sleep = await AppleHealthKit.getSleepSamplesAsync(startDate, endDate);
  if (sleep.length === 0) {
    return 0;
  }

  const totalSleep = sleep.reduce((sum, sample) => {
    const duration = (new Date(sample.endDate) - new Date(sample.startDate)) / (1000 * 60 * 60);
    return sum + duration;
  }, 0);

  return totalSleep;
};

export const syncHeartRate = async (date) => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple Health is only available on iOS');
  }

  const permissions = {
    permissions: {
      read: [AppleHealthKit.Permissions.HeartRate],
    },
  };

  const isAvailable = await AppleHealthKit.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Apple Health is not available');
  }

  await AppleHealthKit.initHealthKit(permissions);

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const heartRate = await AppleHealthKit.getHeartRateSamplesAsync(startDate, endDate);
  if (heartRate.length === 0) {
    return 0;
  }

  const avgHeartRate = heartRate.reduce((sum, sample) => sum + sample.value, 0) / heartRate.length;
  return avgHeartRate;
};
