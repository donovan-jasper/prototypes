import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('calibrate.db');

export const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS decisions (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, actualValue REAL, estimatedValue REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);'
    );
  });
};

export const fetchDecisions = (callback: (decisions: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM decisions ORDER BY timestamp DESC;',
      [],
      (_, { rows: { _array } }) => callback(_array)
    );
  });
};

export const addDecision = (description: string, actualValue: number, estimatedValue: number, callback: () => void) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO decisions (description, actualValue, estimatedValue) VALUES (?, ?, ?);',
      [description, actualValue, estimatedValue],
      () => callback()
    );
  });
};
