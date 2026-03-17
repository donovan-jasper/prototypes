import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const db = SQLite.openDatabase('sensorsync.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create sensors table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sensors (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            connection_type TEXT NOT NULL,
            is_connected INTEGER DEFAULT 0,
            last_updated INTEGER,
            owner_email TEXT,
            shared_with TEXT
          );`
        );

        // Create readings table with timestamp index
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            value REAL NOT NULL,
            confidence REAL,
            FOREIGN KEY(sensor_id) REFERENCES sensors(id)
          );`
        );

        // Create index for faster time-range queries
        tx.executeSql(
          `CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp);`
        );

        // Create alerts table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS alerts (
            id TEXT PRIMARY KEY,
            sensor_id TEXT NOT NULL,
            type TEXT NOT NULL,
            value REAL,
            condition TEXT,
            hysteresis REAL,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY(sensor_id) REFERENCES sensors(id)
          );`
        );

        // Create alert history table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS alert_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_id TEXT NOT NULL,
            sensor_id TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            value REAL,
            FOREIGN KEY(alert_id) REFERENCES alerts(id),
            FOREIGN KEY(sensor_id) REFERENCES sensors(id)
          );`
        );

        // Create users table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            subscription_status TEXT DEFAULT 'free',
            created_at INTEGER NOT NULL
          );`
        );

        // Create family sharing table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS family_sharing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_email TEXT NOT NULL,
            member_email TEXT NOT NULL,
            access_level TEXT DEFAULT 'viewer',
            FOREIGN KEY(owner_email) REFERENCES users(email),
            UNIQUE(owner_email, member_email)
          );`
        );

        // Create analytics reports table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS analytics_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sensor_id TEXT NOT NULL,
            generated_at INTEGER NOT NULL,
            report_data TEXT NOT NULL,
            FOREIGN KEY(sensor_id) REFERENCES sensors(id)
          );`
        );
      },
      (error) => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve(true);
      }
    );
  });
};

export const saveSensorReading = async (reading: {
  sensorId: string;
  timestamp: number;
  value: number;
  confidence?: number;
}) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO readings (sensor_id, timestamp, value, confidence) VALUES (?, ?, ?, ?)',
          [reading.sensorId, reading.timestamp, reading.value, reading.confidence || 1],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getSensorReadings = async (sensorId: string, limit: number = 100) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM readings WHERE sensor_id = ? ORDER BY timestamp DESC LIMIT ?',
          [sensorId, limit],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getSharedSensors = async (userEmail: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT s.* FROM sensors s
           JOIN family_sharing fs ON s.owner_email = fs.owner_email
           WHERE fs.member_email = ?`,
          [userEmail],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const addFamilyMember = async (ownerEmail: string, memberEmail: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO family_sharing (owner_email, member_email) VALUES (?, ?)',
          [ownerEmail, memberEmail],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const removeFamilyMember = async (ownerEmail: string, memberEmail: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM family_sharing WHERE owner_email = ? AND member_email = ?',
          [ownerEmail, memberEmail],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const saveAnalyticsReport = async (sensorId: string, reportData: any) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO analytics_reports (sensor_id, generated_at, report_data) VALUES (?, ?, ?)',
          [sensorId, Date.now(), JSON.stringify(reportData)],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getAnalyticsReports = async (sensorId: string, limit: number = 5) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM analytics_reports WHERE sensor_id = ? ORDER BY generated_at DESC LIMIT ?',
          [sensorId, limit],
          (_, { rows }) => {
            const reports = rows._array.map(row => ({
              ...row,
              reportData: JSON.parse(row.report_data)
            }));
            resolve(reports);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};
