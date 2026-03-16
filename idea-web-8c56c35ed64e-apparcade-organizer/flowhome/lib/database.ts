import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('flowhome.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS app_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        package_name TEXT NOT NULL,
        app_name TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        context_time TEXT,
        context_location TEXT
      );`,
      [],
      () => console.log('app_usage table created'),
      (_, error) => console.error('Error creating app_usage table:', error)
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS smart_collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        app_packages TEXT NOT NULL,
        last_updated INTEGER NOT NULL
      );`,
      [],
      () => console.log('smart_collections table created'),
      (_, error) => console.error('Error creating smart_collections table:', error)
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS focus_modes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        allowed_apps TEXT NOT NULL,
        blocked_apps TEXT NOT NULL,
        is_active INTEGER NOT NULL
      );`,
      [],
      () => console.log('focus_modes table created'),
      (_, error) => console.error('Error creating focus_modes table:', error)
    );

    tx.executeSql(
      `CREATE INDEX IF NOT EXISTS idx_app_usage_package_name ON app_usage (package_name);`,
      [],
      () => console.log('Index on package_name created'),
      (_, error) => console.error('Error creating index on package_name:', error)
    );

    tx.executeSql(
      `CREATE INDEX IF NOT EXISTS idx_app_usage_timestamp ON app_usage (timestamp);`,
      [],
      () => console.log('Index on timestamp created'),
      (_, error) => console.error('Error creating index on timestamp:', error)
    );
  });
};

export const logAppUsage = (packageName: string, appName: string, timestamp: number, duration: number, contextTime: string, contextLocation: string) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO app_usage (package_name, app_name, timestamp, duration, context_time, context_location) VALUES (?, ?, ?, ?, ?, ?);`,
      [packageName, appName, timestamp, duration, contextTime, contextLocation],
      () => console.log('App usage logged'),
      (_, error) => console.error('Error logging app usage:', error)
    );
  });
};

export const getAppUsage = (callback: (usage: any[]) => void) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM app_usage ORDER BY timestamp DESC LIMIT 1000;`,
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => console.error('Error fetching app usage:', error)
    );
  });
};

export const saveSmartCollection = (name: string, appPackages: string, lastUpdated: number) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO smart_collections (name, app_packages, last_updated) VALUES (?, ?, ?);`,
      [name, appPackages, lastUpdated],
      () => console.log('Smart collection saved'),
      (_, error) => console.error('Error saving smart collection:', error)
    );
  });
};

export const getSmartCollections = (callback: (collections: any[]) => void) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM smart_collections ORDER BY last_updated DESC;`,
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => console.error('Error fetching smart collections:', error)
    );
  });
};

export const saveFocusMode = (name: string, allowedApps: string, blockedApps: string, isActive: boolean) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO focus_modes (name, allowed_apps, blocked_apps, is_active) VALUES (?, ?, ?, ?);`,
      [name, allowedApps, blockedApps, isActive ? 1 : 0],
      () => console.log('Focus mode saved'),
      (_, error) => console.error('Error saving focus mode:', error)
    );
  });
};

export const getFocusModes = (callback: (modes: any[]) => void) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM focus_modes;`,
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => console.error('Error fetching focus modes:', error)
    );
  });
};

export const updateFocusMode = (id: number, isActive: boolean) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE focus_modes SET is_active = ? WHERE id = ?;`,
      [isActive ? 1 : 0, id],
      () => console.log('Focus mode updated'),
      (_, error) => console.error('Error updating focus mode:', error)
    );
  });
};
