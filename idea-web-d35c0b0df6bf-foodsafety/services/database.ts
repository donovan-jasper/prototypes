import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('foodguard.db');

export const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS establishments (id TEXT PRIMARY KEY, name TEXT, address TEXT, latitude REAL, longitude REAL, safetyScore TEXT, lastInspectionDate TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS inspections (id INTEGER PRIMARY KEY AUTOINCREMENT, establishmentId TEXT, inspectionDate TEXT, violations TEXT, criticalViolations INTEGER, nonCriticalViolations INTEGER, FOREIGN KEY(establishmentId) REFERENCES establishments(id));'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS saved_locations (id INTEGER PRIMARY KEY AUTOINCREMENT, establishmentId TEXT, name TEXT, address TEXT, safetyScore TEXT, lastInspectionDate TEXT, savedDate TEXT, FOREIGN KEY(establishmentId) REFERENCES establishments(id));'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS recall_alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, establishmentId TEXT, recallDate TEXT, description TEXT, FOREIGN KEY(establishmentId) REFERENCES establishments(id));'
    );
  });
};

export const addRecallAlert = (establishmentId: string, recallDate: string, description: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO recall_alerts (establishmentId, recallDate, description) VALUES (?, ?, ?);',
        [establishmentId, recallDate, description],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getRecallAlertsForEstablishment = (establishmentId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM recall_alerts WHERE establishmentId = ? ORDER BY recallDate DESC;',
        [establishmentId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveLocation = (location: {
  establishmentId: string;
  name: string;
  address: string;
  safetyScore: string;
  lastInspectionDate: string;
  savedDate: string;
}) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO saved_locations (establishmentId, name, address, safetyScore, lastInspectionDate, savedDate) VALUES (?, ?, ?, ?, ?, ?);',
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
    });
  });
};

export const getSavedLocations = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM saved_locations ORDER BY savedDate DESC;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const isLocationSaved = (establishmentId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM saved_locations WHERE establishmentId = ?;',
        [establishmentId],
        (_, { rows }) => {
          const count = rows._array[0].count;
          resolve(count > 0);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const removeLocation = (establishmentId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM saved_locations WHERE establishmentId = ?;',
        [establishmentId],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
