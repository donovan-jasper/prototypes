import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('sensorsync.db');

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

export const getSensorReadings = async (sensorId: string, timeRange: '1h' | '6h' | '24h' | '7d' | '30d' | 'all' = 'all', limit: number = 1000) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        let query = 'SELECT * FROM readings WHERE sensor_id = ?';
        let params: any[] = [sensorId];

        if (timeRange !== 'all') {
          const now = Date.now();
          let startTime = now;

          switch (timeRange) {
            case '1h':
              startTime = now - 3600000;
              break;
            case '6h':
              startTime = now - 21600000;
              break;
            case '24h':
              startTime = now - 86400000;
              break;
            case '7d':
              startTime = now - 604800000;
              break;
            case '30d':
              startTime = now - 2592000000;
              break;
          }

          query += ' AND timestamp >= ?';
          params.push(startTime);
        }

        query += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(limit);

        tx.executeSql(
          query,
          params,
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getReadingsForCorrelation = async (sensorId: string, startTime: number, endTime: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM readings WHERE sensor_id = ? AND timestamp >= ? AND timestamp <= ? ORDER BY timestamp',
          [sensorId, startTime, endTime],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};
