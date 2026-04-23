import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('strikezone.db');

export interface PerformanceRecord {
  id?: number;
  challengeId: string;
  score: number;
  accuracy: number;
  timeMs: number;
  timestamp: number;
}

export async function initializeDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS performances (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          challenge_id TEXT NOT NULL,
          score INTEGER NOT NULL,
          accuracy REAL NOT NULL,
          time_ms INTEGER NOT NULL,
          timestamp INTEGER NOT NULL
        );`,
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
}

export async function savePerformance(record: PerformanceRecord) {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO performances (challenge_id, score, accuracy, time_ms, timestamp)
         VALUES (?, ?, ?, ?, ?);`,
        [record.challengeId, record.score, record.accuracy, record.timeMs, record.timestamp],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
}

export async function getRecentScores(challengeId: string, days: number = 7): Promise<PerformanceRecord[]> {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM performances
         WHERE challenge_id = ? AND timestamp >= ?
         ORDER BY timestamp DESC;`,
        [challengeId, cutoff],
        (_, { rows }) => {
          const records: PerformanceRecord[] = [];
          for (let i = 0; i < rows.length; i++) {
            records.push(rows.item(i));
          }
          resolve(records);
        },
        (_, error) => reject(error)
      );
    });
  });
}

export async function getStreakCount(challengeId: string): Promise<number> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT COUNT(*) as count FROM performances
         WHERE challenge_id = ? AND timestamp >= ?
         ORDER BY timestamp DESC;`,
        [challengeId, Date.now() - (24 * 60 * 60 * 1000)],
        (_, { rows }) => {
          resolve(rows.item(0).count);
        },
        (_, error) => reject(error)
      );
    });
  });
}
