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
      (_, error) => {
        console.error('Error creating app_usage table:', error);
        return false;
      }
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
      (_, error) => {
        console.error('Error creating smart_collections table:', error);
        return false;
      }
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
      (_, error) => {
        console.error('Error creating focus_modes table:', error);
        return false;
      }
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS scanned_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        package_name TEXT NOT NULL UNIQUE,
        app_name TEXT NOT NULL,
        icon_uri TEXT,
        last_scanned INTEGER NOT NULL
      );`,
      [],
      () => console.log('scanned_apps table created'),
      (_, error) => {
        console.error('Error creating scanned_apps table:', error);
        return false;
      }
    );

    tx.executeSql(
      `CREATE INDEX IF NOT EXISTS idx_app_usage_package_name ON app_usage (package_name);`,
      [],
      () => console.log('Index on package_name created'),
      (_, error) => {
        console.error('Error creating index on package_name:', error);
        return false;
      }
    );

    tx.executeSql(
      `CREATE INDEX IF NOT EXISTS idx_app_usage_timestamp ON app_usage (timestamp);`,
      [],
      () => console.log('Index on timestamp created'),
      (_, error) => {
        console.error('Error creating index on timestamp:', error);
        return false;
      }
    );
  });
};

export const logAppUsage = (packageName: string, appName: string, timestamp: number, duration: number, contextTime: string, contextLocation: string) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO app_usage (package_name, app_name, timestamp, duration, context_time, context_location) VALUES (?, ?, ?, ?, ?, ?);`,
      [packageName, appName, timestamp, duration, contextTime, contextLocation],
      () => console.log('App usage logged'),
      (_, error) => {
        console.error('Error logging app usage:', error);
        return false;
      }
    );
  });
};

export const getAppUsage = (callback: (usage: any[]) => void) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM app_usage ORDER BY timestamp DESC LIMIT 1000;`,
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => {
        console.error('Error fetching app usage:', error);
        return false;
      }
    );
  });
};

export const saveSmartCollection = (name: string, appPackages: string[], lastUpdated: number) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO smart_collections (name, app_packages, last_updated) VALUES (?, ?, ?);`,
      [name, JSON.stringify(appPackages), lastUpdated],
      () => console.log('Smart collection saved'),
      (_, error) => {
        console.error('Error saving smart collection:', error);
        return false;
      }
    );
  });
};

export const getSmartCollections = (callback: (collections: any[]) => void) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM smart_collections ORDER BY last_updated DESC;`,
      [],
      (_, { rows }) => {
        const collections = rows._array.map(col => ({
          ...col,
          app_packages: JSON.parse(col.app_packages)
        }));
        callback(collections);
      },
      (_, error) => {
        console.error('Error fetching smart collections:', error);
        return false;
      }
    );
  });
};

export const updateSmartCollections = async () => {
  const collections = await generateSmartCollections();
  const timestamp = Date.now();

  db.transaction((tx) => {
    // Clear existing collections
    tx.executeSql(
      `DELETE FROM smart_collections;`,
      [],
      () => {
        // Insert new collections
        collections.forEach(collection => {
          tx.executeSql(
            `INSERT INTO smart_collections (name, app_packages, last_updated) VALUES (?, ?, ?);`,
            [collection.name, JSON.stringify(collection.apps), timestamp],
            () => console.log(`Collection ${collection.name} saved`),
            (_, error) => {
              console.error(`Error saving collection ${collection.name}:`, error);
              return false;
            }
          );
        });
      },
      (_, error) => {
        console.error('Error clearing collections:', error);
        return false;
      }
    );
  });
};

export const saveFocusMode = (name: string, allowedApps: string[], blockedApps: string[], isActive: boolean) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO focus_modes (name, allowed_apps, blocked_apps, is_active) VALUES (?, ?, ?, ?);`,
      [name, JSON.stringify(allowedApps), JSON.stringify(blockedApps), isActive ? 1 : 0],
      () => console.log('Focus mode saved'),
      (_, error) => {
        console.error('Error saving focus mode:', error);
        return false;
      }
    );
  });
};

export const getFocusModes = (callback: (modes: any[]) => void) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM focus_modes;`,
      [],
      (_, { rows }) => {
        const modes = rows._array.map(mode => ({
          ...mode,
          allowed_apps: JSON.parse(mode.allowed_apps),
          blocked_apps: JSON.parse(mode.blocked_apps),
          is_active: mode.is_active === 1
        }));
        callback(modes);
      },
      (_, error) => {
        console.error('Error fetching focus modes:', error);
        return false;
      }
    );
  });
};

export const updateFocusMode = (id: number, isActive: boolean) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE focus_modes SET is_active = ? WHERE id = ?;`,
      [isActive ? 1 : 0, id],
      () => console.log(`Focus mode ${id} updated`),
      (_, error) => {
        console.error(`Error updating focus mode ${id}:`, error);
        return false;
      }
    );
  });
};
