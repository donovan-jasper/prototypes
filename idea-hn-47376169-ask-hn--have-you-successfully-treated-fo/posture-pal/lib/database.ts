import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('posturepal.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT,
        duration INTEGER,
        instructions TEXT,
        difficulty TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS pain_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS posture_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uri TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        is_premium BOOLEAN DEFAULT 0,
        notifications_enabled BOOLEAN DEFAULT 1,
        streak INTEGER DEFAULT 0,
        last_completed DATETIME
      );`
    );
  });
};

export const logPainEntry = (level: number) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO pain_logs (level) VALUES (?);',
        [level],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getPainHistory = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM pain_logs ORDER BY timestamp DESC LIMIT 30;',
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const addPosturePhoto = (uri: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO posture_photos (uri) VALUES (?);',
        [uri],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getPosturePhotos = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM posture_photos ORDER BY timestamp DESC;',
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getStreakCount = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT streak FROM user_settings LIMIT 1;',
        [],
        (_, result) => resolve(result.rows._array[0]?.streak || 0),
        (_, error) => reject(error)
      );
    });
  });
};

export const incrementStreak = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE user_settings SET streak = streak + 1, last_completed = CURRENT_TIMESTAMP;',
        [],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const resetStreak = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE user_settings SET streak = 0;',
        [],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const togglePremium = (isPremium: boolean) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE user_settings SET is_premium = ?;',
        [isPremium ? 1 : 0],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const toggleNotifications = (notificationsEnabled: boolean) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE user_settings SET notifications_enabled = ?;',
        [notificationsEnabled ? 1 : 0],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
