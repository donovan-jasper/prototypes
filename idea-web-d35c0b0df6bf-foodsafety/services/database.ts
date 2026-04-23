import * as SQLite from 'expo-sqlite';
import { SavedLocation, RecallAlert } from '@/types';

const db = SQLite.openDatabase('foodguard.db');

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Create tables if they don't exist
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS saved_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            establishmentId TEXT UNIQUE,
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
            isRead BOOLEAN DEFAULT 0,
            FOREIGN KEY (establishmentId) REFERENCES saved_locations (establishmentId)
          );`
        );
      },
      error => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve(true);
      }
    );
  });
};

export const saveLocation = async (location: Omit<SavedLocation, 'id'>) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO saved_locations (establishmentId, name, address, safetyScore, lastInspectionDate, savedDate)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            location.establishmentId,
            location.name,
            location.address,
            location.safetyScore,
            location.lastInspectionDate,
            location.savedDate
          ],
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
          `SELECT * FROM saved_locations ORDER BY savedDate DESC`,
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

export const removeLocation = async (establishmentId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // First remove any recall alerts for this location
        tx.executeSql(
          `DELETE FROM recall_alerts WHERE establishmentId = ?`,
          [establishmentId]
        );

        // Then remove the location itself
        tx.executeSql(
          `DELETE FROM saved_locations WHERE establishmentId = ?`,
          [establishmentId],
          (_, result) => resolve(result),
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
          `SELECT COUNT(*) as count FROM saved_locations WHERE establishmentId = ?`,
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

export const addRecallAlert = async (establishmentId: string, recallDate: string, description: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO recall_alerts (establishmentId, recallDate, description)
           VALUES (?, ?, ?)`,
          [establishmentId, recallDate, description],
          (_, result) => resolve(result),
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
          `SELECT * FROM recall_alerts WHERE establishmentId = ? ORDER BY recallDate DESC`,
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

export const getAllRecallAlerts = async (): Promise<RecallAlert[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM recall_alerts ORDER BY recallDate DESC`,
          [],
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

export const markRecallAlertAsRead = async (alertId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `UPDATE recall_alerts SET isRead = 1 WHERE id = ?`,
          [alertId],
          (_, result) => resolve(result),
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
          `SELECT COUNT(*) as count FROM recall_alerts WHERE isRead = 0`,
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
