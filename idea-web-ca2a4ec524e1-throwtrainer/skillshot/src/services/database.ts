import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('skillshot.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, activityType TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, sessionId INTEGER, speed REAL, angle REAL, hit BOOLEAN, timestamp TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS challenges (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, reward TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS user_settings (id INTEGER PRIMARY KEY AUTOINCREMENT, isPremium BOOLEAN, activityType TEXT, sessionCount INTEGER);'
    );
  });
};

export const createSession = (activityType) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO sessions (date, activityType) VALUES (?, ?);',
        [new Date().toISOString(), activityType],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const logAttempt = (sessionId, speed, angle, hit) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO attempts (sessionId, speed, angle, hit, timestamp) VALUES (?, ?, ?, ?, ?);',
        [sessionId, speed, angle, hit, new Date().toISOString()],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getStats = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT COUNT(*) as totalShots, AVG(hit) as accuracy FROM attempts;',
        [],
        (_, { rows }) => {
          const stats = rows._array[0];
          resolve({
            totalShots: stats.totalShots,
            highestAccuracy: Math.round(stats.accuracy * 100),
            bestStreak: 0, // Placeholder, implement streak calculation
          });
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getPersonalRecords = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT MAX(speed) as maxSpeed, MAX(angle) as maxAngle FROM attempts;',
        [],
        (_, { rows }) => resolve(rows._array[0]),
        (_, error) => reject(error)
      );
    });
  });
};
