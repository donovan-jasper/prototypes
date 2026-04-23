import * as SQLite from 'expo-sqlite';
import { Session, DrowsinessEvent } from '../types';

export class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase('flowguard.db');
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            profileId TEXT,
            startTime INTEGER,
            endTime INTEGER,
            drowsinessEvents INTEGER
          );`,
          [],
          () => {
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS drowsinessEvents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sessionId INTEGER,
                timestamp INTEGER,
                alertLevel INTEGER,
                profile TEXT,
                FOREIGN KEY(sessionId) REFERENCES sessions(id)
              );`,
              [],
              () => resolve(),
              (_, error) => reject(error)
            );
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async saveSession(session: Omit<Session, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO sessions (profileId, startTime, endTime, drowsinessEvents) VALUES (?, ?, ?, ?)',
          [session.profileId, session.startTime, session.endTime, session.drowsinessEvents],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      });
    });
  }

  async recordDrowsinessEvent(event: Omit<DrowsinessEvent, 'id'> & { sessionId?: number }): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO drowsinessEvents (sessionId, timestamp, alertLevel, profile) VALUES (?, ?, ?, ?)',
          [event.sessionId || null, event.timestamp, event.alertLevel, event.profile],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getRecentSessions(limit: number = 10): Promise<Session[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM sessions ORDER BY startTime DESC LIMIT ?',
          [limit],
          (_, { rows }) => resolve(rows._array as Session[]),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getWeeklyStats(): Promise<{ totalSessions: number; totalDuration: number; totalDrowsinessEvents: number }> {
    return new Promise((resolve, reject) => {
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT COUNT(*) as totalSessions,
                  SUM(endTime - startTime) as totalDuration,
                  SUM(drowsinessEvents) as totalDrowsinessEvents
           FROM sessions
           WHERE startTime >= ?`,
          [oneWeekAgo],
          (_, { rows }) => {
            const result = rows._array[0];
            resolve({
              totalSessions: result.totalSessions || 0,
              totalDuration: result.totalDuration || 0,
              totalDrowsinessEvents: result.totalDrowsinessEvents || 0
            });
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM sessions',
          [],
          () => {
            tx.executeSql(
              'DELETE FROM drowsinessEvents',
              [],
              () => resolve(),
              (_, error) => reject(error)
            );
          },
          (_, error) => reject(error)
        );
      });
    });
  }
}
