import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('callguard.db');

const storage = {
  init: () => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS calls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            caller_id TEXT,
            call_time TEXT,
            transcript TEXT,
            summary TEXT,
            status TEXT
          );
        `, [],
        () => {
          console.log('Calls table created or exists.');
          resolve();
        },
        (tx, error) => {
          console.error('Error creating calls table:', error);
          reject(error);
        });
      });
    });
  },

  saveCallData: (callData) => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(`
          INSERT INTO calls (caller_id, call_time, transcript, summary, status)
          VALUES (?, ?, ?, ?, ?);
        `, [callData.callerId, callData.callTime, callData.transcript, callData.summary, callData.status],
        (_, resultSet) => {
          console.log('Call data saved:', resultSet);
          resolve(resultSet.insertId);
        },
        (tx, error) => {
          console.error('Error saving call data:', error);
          reject(error);
        });
      });
    });
  },

  getCallData: () => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(`
          SELECT * FROM calls ORDER BY call_time DESC;
        `, [],
        (_, { rows }) => {
          const calls = rows._array;
          console.log('Fetched past calls:', calls);
          resolve(calls);
        },
        (tx, error) => {
          console.error('Error fetching call data:', error);
          reject(error);
        });
      });
    });
  },

  clearAllCalls: () => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(`
          DELETE FROM calls;
        `, [],
        (_, resultSet) => {
          console.log('All calls cleared:', resultSet);
          resolve();
        },
        (tx, error) => {
          console.error('Error clearing calls:', error);
          reject(error);
        });
      });
    });
  }
};

// Initialize the database when the module is imported
storage.init().catch(error => console.error("Failed to initialize storage:", error));

export default storage;
