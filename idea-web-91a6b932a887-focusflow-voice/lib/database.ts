import * as SQLite from 'expo-sqlite';
import { format, isSameDay, parseISO } from 'date-fns';

const db = SQLite.openDatabase('zensprint.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Create sessions table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            duration INTEGER NOT NULL,
            startTime TEXT NOT NULL,
            endTime TEXT,
            completed INTEGER DEFAULT 0,
            voicePack TEXT NOT NULL
          );`
        );

        // Create streaks table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS streaks (
            date TEXT PRIMARY KEY,
            sessionsCompleted INTEGER DEFAULT 1
          );`
        );

        // Create pods table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS pods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            members TEXT NOT NULL,
            createdAt TEXT NOT NULL
          );`
        );

        // Create rewards table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            pointsRequired INTEGER NOT NULL,
            unlocked INTEGER DEFAULT 0
          );`
        );
      },
      error => reject(error),
      () => resolve(true)
    );
  });
};

export const createSession = async (duration: number, voicePack: string) => {
  return new Promise((resolve, reject) => {
    const startTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT INTO sessions (duration, startTime, voicePack) VALUES (?, ?, ?);',
          [duration, startTime, voicePack],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const completeSession = async (sessionId: number) => {
  return new Promise((resolve, reject) => {
    const endTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    const today = format(new Date(), 'yyyy-MM-dd');

    db.transaction(
      tx => {
        // Update session as completed
        tx.executeSql(
          'UPDATE sessions SET completed = 1, endTime = ? WHERE id = ?;',
          [endTime, sessionId],
          () => {
            // Update or create streak record
            tx.executeSql(
              `INSERT OR REPLACE INTO streaks (date, sessionsCompleted)
               VALUES (?, COALESCE((SELECT sessionsCompleted FROM streaks WHERE date = ?), 0) + 1);`,
              [today, today],
              () => resolve(true),
              (_, error) => reject(error)
            );
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const getStreak = async () => {
  return new Promise((resolve, reject) => {
    const today = new Date();
    let streak = 0;

    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT date FROM streaks ORDER BY date DESC;',
          [],
          (_, { rows }) => {
            for (let i = 0; i < rows.length; i++) {
              const sessionDate = parseISO(rows.item(i).date);
              const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

              if (daysDiff === streak) {
                streak++;
              } else {
                break;
              }
            }
            resolve(streak);
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const getLastSessionDate = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT date FROM streaks ORDER BY date DESC LIMIT 1;',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0).date);
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const resetStreak = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'DELETE FROM streaks;',
          [],
          () => resolve(true),
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const getTotalPoints = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT SUM(duration) as totalPoints FROM sessions WHERE completed = 1;',
          [],
          (_, { rows }) => {
            resolve(rows.item(0).totalPoints || 0);
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};
