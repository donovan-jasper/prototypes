import * as SQLite from 'expo-sqlite';
import { Decision } from '../types/Decision';

const db = SQLite.openDatabase('calibrate.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS decisions (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'description TEXT NOT NULL,' +
        'actualValue REAL NOT NULL,' +
        'estimatedValue REAL NOT NULL,' +
        'timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,' +
        'successes INTEGER DEFAULT 0,' +
        'failures INTEGER DEFAULT 0' +
        ');',
        [],
        () => resolve(true),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveDecision = async (decision: Omit<Decision, 'id' | 'timestamp'>) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO decisions (description, actualValue, estimatedValue, successes, failures) ' +
        'VALUES (?, ?, ?, ?, ?);',
        [decision.description, decision.actualValue, decision.estimatedValue, decision.successes, decision.failures],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getDecisions = async (): Promise<Decision[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM decisions ORDER BY timestamp DESC;',
        [],
        (_, { rows }) => resolve(rows._array as Decision[]),
        (_, error) => reject(error)
      );
    });
  });
};

export const getRecentDecisions = async (limit: number = 5): Promise<Decision[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM decisions ORDER BY timestamp DESC LIMIT ?;',
        [limit],
        (_, { rows }) => resolve(rows._array as Decision[]),
        (_, error) => reject(error)
      );
    });
  });
};

export const getCalibrationStats = async (): Promise<{ totalSuccesses: number; totalFailures: number }> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT SUM(successes) as totalSuccesses, SUM(failures) as totalFailures FROM decisions;',
        [],
        (_, { rows }) => {
          const result = rows._array[0];
          resolve({
            totalSuccesses: result.totalSuccesses || 0,
            totalFailures: result.totalFailures || 0
          });
        },
        (_, error) => reject(error)
      );
    });
  });
};
