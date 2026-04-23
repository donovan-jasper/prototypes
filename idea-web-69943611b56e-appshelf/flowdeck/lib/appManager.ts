import { NativeModules, Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('flowdeck.db');
const { AppListModule } = NativeModules;

interface App {
  packageName: string;
  label: string;
  icon: string;
  lastUsed?: string;
}

export const getInstalledApps = async (): Promise<App[]> => {
  if (Platform.OS === 'ios') {
    return [];
  }

  try {
    const apps = await AppListModule.getInstalledApps();
    return apps.map((app: any) => ({
      packageName: app.packageName,
      label: app.label,
      icon: app.icon,
      lastUsed: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error getting installed apps:', error);
    return [];
  }
};

export const cacheApps = async (apps: App[]) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First clear existing apps
      tx.executeSql('DELETE FROM apps;', [], () => {
        // Then insert new ones
        apps.forEach(app => {
          tx.executeSql(
            `INSERT INTO apps (packageName, label, icon, lastUsed)
             VALUES (?, ?, ?, ?);`,
            [app.packageName, app.label, app.icon, app.lastUsed || new Date().toISOString()],
            () => {},
            (_, error) => {
              console.error('Error caching app:', error);
              return false;
            }
          );
        });
      }, (_, error) => {
        console.error('Error clearing apps:', error);
        reject(error);
        return false;
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

export const updateAppLastUsed = async (packageName: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE apps SET lastUsed = ? WHERE packageName = ?;`,
        [new Date().toISOString(), packageName],
        () => resolve(true),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
