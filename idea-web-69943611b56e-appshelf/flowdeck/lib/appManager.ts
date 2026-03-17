import { NativeModules, Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('flowdeck.db');
const { AppListModule } = NativeModules;

export const getInstalledApps = async (): Promise<App[]> => {
  if (Platform.OS === 'ios') {
    return [];
  }

  try {
    const apps = await AppListModule.getInstalledApps();
    return apps.map((app: any) => ({
      packageName: app.packageName,
      label: app.label,
      icon: `data:image/png;base64,${app.icon}`,
    }));
  } catch (error) {
    console.error('Error getting installed apps:', error);
    return [];
  }
};

export const cacheApps = async (apps: App[]) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      apps.forEach(app => {
        tx.executeSql(
          `INSERT OR REPLACE INTO apps (packageName, label, icon, lastUsed)
           VALUES (?, ?, ?, ?);`,
          [app.packageName, app.label, app.icon, new Date().toISOString()],
          () => {},
          (_, error) => {
            console.error('Error caching app:', error);
            return false;
          }
        );
      });
    }, reject, resolve);
  });
};

export const getCachedApps = (): Promise<App[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM apps;`,
        [],
        (_, { rows: { _array } }) => {
          resolve(_array);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
