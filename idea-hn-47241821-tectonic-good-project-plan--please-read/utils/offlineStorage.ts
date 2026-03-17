import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('safecircle.db');

export const initOfflineStorage = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create resources table if it doesn't exist
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS offline_resources (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          address TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          phone TEXT,
          hours TEXT,
          wheelchair_accessible BOOLEAN,
          pet_friendly BOOLEAN,
          open_now BOOLEAN,
          last_updated INTEGER
        );`,
        [],
        () => resolve(db),
        (_, error) => reject(error)
      );
    });
  });
};

export const cacheResources = async (resources: any[]) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Clear existing cached resources
      tx.executeSql('DELETE FROM offline_resources', []);

      // Insert new resources
      resources.forEach(resource => {
        tx.executeSql(
          `INSERT INTO offline_resources (
            id, name, type, address, latitude, longitude, phone, hours,
            wheelchair_accessible, pet_friendly, open_now, last_updated
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            resource.id,
            resource.name,
            resource.type,
            resource.address,
            resource.latitude,
            resource.longitude,
            resource.phone,
            resource.hours,
            resource.wheelchair_accessible ? 1 : 0,
            resource.pet_friendly ? 1 : 0,
            resource.open_now ? 1 : 0,
            Date.now()
          ]
        );
      });

      resolve(true);
    }, (error) => reject(error));
  });
};

export const getCachedResources = async () => {
  return new Promise<any[]>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM offline_resources`,
        [],
        (_, result) => {
          const resources = [];
          for (let i = 0; i < result.rows.length; i++) {
            resources.push(result.rows.item(i));
          }
          resolve(resources);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const isCacheValid = async (maxAgeHours: number = 24) => {
  return new Promise<boolean>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as count FROM offline_resources
         WHERE last_updated > ?`,
        [Date.now() - (maxAgeHours * 60 * 60 * 1000)],
        (_, result) => {
          resolve(result.rows.item(0).count > 0);
        },
        (_, error) => reject(error)
      );
    });
  });
};
