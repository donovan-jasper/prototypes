import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('peerverse.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS pending_submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, paper_data TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);',
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const addPendingSubmission = async (paperData) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO pending_submissions (paper_data) VALUES (?);',
        [JSON.stringify(paperData)],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getPendingSubmissions = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM pending_submissions ORDER BY timestamp ASC;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const removePendingSubmission = async (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM pending_submissions WHERE id = ?;',
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
