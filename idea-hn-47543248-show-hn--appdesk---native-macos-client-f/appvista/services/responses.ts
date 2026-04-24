import { openDatabase } from 'expo-sqlite';

const db = openDatabase('appvista.db');

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS responses (id TEXT PRIMARY KEY, reviewId TEXT, response TEXT, timestamp INTEGER);',
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveResponse = async (reviewId: string, response: string) => {
  const timestamp = Date.now();
  const id = `${reviewId}_${timestamp}`;

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO responses (id, reviewId, response, timestamp) VALUES (?, ?, ?, ?);',
        [id, reviewId, response, timestamp],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getResponses = async (reviewId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM responses WHERE reviewId = ? ORDER BY timestamp DESC;',
        [reviewId],
        (_, { rows }) => {
          const responses = [];
          for (let i = 0; i < rows.length; i++) {
            responses.push(rows.item(i));
          }
          resolve(responses);
        },
        (_, error) => reject(error)
      );
    });
  });
};
