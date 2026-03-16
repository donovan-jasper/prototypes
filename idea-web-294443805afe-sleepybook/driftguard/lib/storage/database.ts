import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('driftguard.db');

export const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sleep_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time TEXT,
        end_time TEXT,
        duration INTEGER,
        confidence REAL,
        notes TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS calibration_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        motion_threshold REAL,
        sound_threshold REAL,
        light_threshold REAL
      );`
    );
  });
};

export const saveSleepSession = (session) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO sleep_sessions (start_time, end_time, duration, confidence, notes) VALUES (?, ?, ?, ?, ?)',
      [session.startTime, session.endTime, session.duration, session.confidence, session.notes]
    );
  });
};

export const getSleepHistory = (days) => {
  return new Promise((resolve, reject) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const cutoffDate = date.toISOString();

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM sleep_sessions WHERE start_time >= ? ORDER BY start_time DESC',
        [cutoffDate],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveCalibrationData = (data) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO calibration_data (motion_threshold, sound_threshold, light_threshold) VALUES (?, ?, ?)',
      [data.motionThreshold, data.soundThreshold, data.lightThreshold]
    );
  });
};
