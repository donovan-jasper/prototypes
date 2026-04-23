import * as SQLite from 'expo-sqlite';
import { SavedLocation, RecallAlert } from '@/types';

const db = SQLite.openDatabase('foodguard.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Create tables if they don't exist
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS saved_locations (
            establishmentId TEXT PRIMARY KEY,
            name TEXT,
            address TEXT,
            safetyScore TEXT,
            lastInspectionDate TEXT,
            savedDate TEXT
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS recall_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            establishmentId TEXT,
            recallDate TEXT,
            description TEXT,
            severity TEXT,
            isRead INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(establishmentId) REFERENCES saved_locations(establishmentId)
          );`
        );
      },
      error => {
        console.error('Error initializing database:', error);
        reject(error);
      },
      () => {
        resolve(true);
      }
    );
  });
};

export const saveLocation = async (location: SavedLocation) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO saved_locations (establishmentId, name, address, safetyScore, lastInspectionDate, savedDate) VALUES (?, ?, ?, ?, ?, ?)',
          [location.establishmentId, location.name, location.address, location.safetyScore, location.lastInspectionDate, location.savedDate],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getSavedLocations = async (): Promise<SavedLocation[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM saved_locations ORDER BY savedDate DESC',
          [],
          (_, { rows }) => {
            const locations: SavedLocation[] = [];
            for (let i = 0; i < rows.length; i++) {
              locations.push(rows.item(i));
            }
            resolve(locations);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const isLocationSaved = async (establishmentId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM saved_locations WHERE establishmentId = ?',
          [establishmentId],
          (_, { rows }) => {
            resolve(rows.item(0).count > 0);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const removeLocation = async (establishmentId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // First delete all related recall alerts
        tx.executeSql(
          'DELETE FROM recall_alerts WHERE establishmentId = ?',
          [establishmentId]
        );

        // Then delete the location
        tx.executeSql(
          'DELETE FROM saved_locations WHERE establishmentId = ?',
          [establishmentId],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const addRecallAlert = async (establishmentId: string, recallDate: string, description: string, severity: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT INTO recall_alerts (establishmentId, recallDate, description, severity) VALUES (?, ?, ?, ?)',
          [establishmentId, recallDate, description, severity],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getRecallAlertsForEstablishment = async (establishmentId: string): Promise<RecallAlert[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM recall_alerts WHERE establishmentId = ? ORDER BY recallDate DESC',
          [establishmentId],
          (_, { rows }) => {
            const alerts: RecallAlert[] = [];
            for (let i = 0; i < rows.length; i++) {
              alerts.push(rows.item(i));
            }
            resolve(alerts);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getUnreadRecallAlertCount = async (): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM recall_alerts WHERE isRead = 0',
          [],
          (_, { rows }) => {
            resolve(rows.item(0).count);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const markRecallAlertAsRead = async (alertId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'UPDATE recall_alerts SET isRead = 1 WHERE id = ?',
          [alertId],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getUnreadRecallAlertCountForLocation = async (establishmentId: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM recall_alerts WHERE establishmentId = ? AND isRead = 0',
          [establishmentId],
          (_, { rows }) => {
            resolve(rows.item(0).count);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};
