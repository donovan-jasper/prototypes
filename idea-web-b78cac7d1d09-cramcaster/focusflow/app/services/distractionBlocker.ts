import * as Notifications from 'expo-notifications';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as ExpoDistractionBlocker from 'expo-distraction-blocker';

const BLOCKED_APPS_KEY = 'blocked_apps';
const DISTRACTION_BLOCKER_KEY = 'distraction_blocker_active';

export const getBlockedApps = async (): Promise<string[]> => {
  try {
    const apps = await AsyncStorage.getItem(BLOCKED_APPS_KEY);
    return apps ? JSON.parse(apps) : [];
  } catch (error) {
    console.error('Failed to get blocked apps:', error);
    return [];
  }
};

export const addBlockedApp = async (packageName: string) => {
  try {
    const currentApps = await getBlockedApps();
    if (!currentApps.includes(packageName)) {
      const updatedApps = [...currentApps, packageName];
      await AsyncStorage.setItem(BLOCKED_APPS_KEY, JSON.stringify(updatedApps));
    }
  } catch (error) {
    console.error('Failed to add blocked app:', error);
  }
};

export const removeBlockedApp = async (packageName: string) => {
  try {
    const currentApps = await getBlockedApps();
    const updatedApps = currentApps.filter(app => app !== packageName);
    await AsyncStorage.setItem(BLOCKED_APPS_KEY, JSON.stringify(updatedApps));
  } catch (error) {
    console.error('Failed to remove blocked app:', error);
  }
};

export const registerDistractionBlocker = async () => {
  try {
    // Block notifications
    await Notifications.setNotificationChannelAsync('focus-mode', {
      name: 'Focus Mode',
      importance: Notifications.AndroidImportance.MIN,
      sound: null,
      vibrationPattern: [],
    });

    // Store the active state
    await AsyncStorage.setItem(DISTRACTION_BLOCKER_KEY, 'true');

    // Platform-specific blocking
    if (Platform.OS === 'ios') {
      // Use native module for iOS ScreenTime
      await ExpoDistractionBlocker.enableScreenTimeBlocking();
    } else if (Platform.OS === 'android') {
      // Android implementation would go here
      // This would require a native module for Android's Digital Wellbeing API
    }

    console.log('Distraction blocker registered');
  } catch (error) {
    console.error('Failed to register distraction blocker:', error);
  }
};

export const unregisterDistractionBlocker = async () => {
  try {
    // Reset notification settings
    await Notifications.setNotificationChannelAsync('focus-mode', {
      name: 'Focus Mode',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });

    // Remove the active state
    await AsyncStorage.removeItem(DISTRACTION_BLOCKER_KEY);

    // Platform-specific unblocking
    if (Platform.OS === 'ios') {
      await ExpoDistractionBlocker.disableScreenTimeBlocking();
    } else if (Platform.OS === 'android') {
      // Android implementation would go here
    }

    console.log('Distraction blocker unregistered');
  } catch (error) {
    console.error('Failed to unregister distraction blocker:', error);
  }
};

export const isDistractionBlockerActive = async (): Promise<boolean> => {
  try {
    const isActive = await AsyncStorage.getItem(DISTRACTION_BLOCKER_KEY);
    return isActive === 'true';
  } catch (error) {
    console.error('Failed to check distraction blocker status:', error);
    return false;
  }
};

export const requestScreenTimePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return await ExpoDistractionBlocker.requestScreenTimePermission();
  }
  return true; // Android doesn't need explicit permission for this API
};
