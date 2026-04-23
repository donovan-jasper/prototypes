import * as Application from 'expo-application';
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as Device from 'expo-device';

const db = SQLite.openDatabase('flowdeck.db');

export const getInstalledApps = async () => {
  if (Platform.OS === 'ios') {
    // iOS doesn't allow listing installed apps, return curated list
    return getCuratedApps();
  }

  try {
    // For Android, we'll use the native module to get installed apps
    // In a real implementation, this would be replaced with the actual native module call
    const installedApps = await getAndroidInstalledApps();

    // Cache apps in SQLite
    await cacheApps(installedApps);
    return installedApps;
  } catch (error) {
    console.error('Error getting installed apps:', error);
    return [];
  }
};

// Native module implementation for Android
const getAndroidInstalledApps = async () => {
  // This is a placeholder - in a real implementation, this would call the native module
  // For now, we'll return a mock list similar to the previous implementation
  return [
    {
      packageName: 'com.google.android.gm',
      label: 'Gmail',
      icon: undefined,
    },
    {
      packageName: 'com.google.android.apps.maps',
      label: 'Maps',
      icon: undefined,
    },
    {
      packageName: 'com.slack',
      label: 'Slack',
      icon: undefined,
    },
    {
      packageName: 'com.instagram.android',
      label: 'Instagram',
      icon: undefined,
    },
    {
      packageName: 'com.whatsapp',
      label: 'WhatsApp',
      icon: undefined,
    },
  ];
};

const getCuratedApps = () => {
  // Curated list of common apps for iOS
  return [
    {
      packageName: 'gmail://',
      label: 'Gmail',
      icon: undefined,
    },
    {
      packageName: 'maps://',
      label: 'Maps',
      icon: undefined,
    },
    {
      packageName: 'slack://',
      label: 'Slack',
      icon: undefined,
    },
    {
      packageName: 'instagram://',
      label: 'Instagram',
      icon: undefined,
    },
    {
      packageName: 'whatsapp://',
      label: 'WhatsApp',
      icon: undefined,
    },
  ];
};

const cacheApps = async (apps) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS apps (packageName TEXT PRIMARY KEY, label TEXT, icon TEXT, lastUsed INTEGER);'
        );

        apps.forEach(app => {
          tx.executeSql(
            'INSERT OR REPLACE INTO apps (packageName, label, icon, lastUsed) VALUES (?, ?, ?, ?);',
            [app.packageName, app.label, app.icon || '', Date.now()]
          );
        });
      },
      error => {
        console.error('Error caching apps:', error);
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
};
