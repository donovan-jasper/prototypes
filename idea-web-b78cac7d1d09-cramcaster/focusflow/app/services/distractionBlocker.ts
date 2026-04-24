import * as Application from 'expo-application';
import { NativeModules, Platform } from 'react-native';

const { DistractionBlockerModule } = NativeModules;

const DISTRACTING_APPS = [
  'com.facebook.katana',
  'com.instagram.android',
  'com.snapchat.android',
  'com.twitter.android',
  'com.whatsapp',
  'com.tiktok.android',
  'com.spotify.music',
  'com.netflix.mediaclient',
  'com.disney.disneyplus',
];

export const registerDistractionBlocker = async () => {
  try {
    if (Platform.OS === 'android') {
      await DistractionBlockerModule.startAccessibilityService();
    } else if (Platform.OS === 'ios') {
      await DistractionBlockerModule.requestScreenTimePermission();
    }
    console.log('Distraction blocker registered for apps:', DISTRACTING_APPS);
  } catch (error) {
    console.error('Failed to register distraction blocker:', error);
    throw error;
  }
};

export const unregisterDistractionBlocker = async () => {
  try {
    if (Platform.OS === 'android') {
      await DistractionBlockerModule.stopAccessibilityService();
    } else if (Platform.OS === 'ios') {
      await DistractionBlockerModule.disableScreenTimeBlocking();
    }
    console.log('Distraction blocker unregistered');
  } catch (error) {
    console.error('Failed to unregister distraction blocker:', error);
    throw error;
  }
};

export const isDistractingApp = (packageName: string) => {
  return DISTRACTING_APPS.includes(packageName);
};
