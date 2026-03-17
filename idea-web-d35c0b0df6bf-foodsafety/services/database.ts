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
      'CREATE TABLE IF NOT EXISTS saved_locations (id INTEGER PRIMARY KEY AUTOINCREMENT, establishmentId TEXT, savedDate TEXT, FOREIGN KEY(establishmentId) REFERENCES establishments(id));'
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
