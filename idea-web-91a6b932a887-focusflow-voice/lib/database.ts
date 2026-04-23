import * as SQLite from 'expo-sqlite';
import { format, isSameDay, subDays } from 'date-fns';

const db = SQLite.openDatabase('zensprint.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
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

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS streaks (
            date TEXT PRIMARY KEY,
            sessionsCompleted INTEGER DEFAULT 1
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            pointsRequired INTEGER NOT NULL,
            unlocked INTEGER DEFAULT 0
          );`
        );

        // Initialize rewards if empty
        tx.executeSql(
          `INSERT OR IGNORE INTO rewards (name, pointsRequired) VALUES
            ('Bronze Badge', 100),
            ('Silver Badge', 500),
            ('Gold Badge', 1000),
            ('Diamond Badge', 2000);`
        );
      },
      (error) => reject(error),
      () => resolve(true)
    );
  });
};

export const createSession = async (duration: number, voicePack: string) => {
  return new Promise<number>((resolve, reject) => {
    const startTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'");

    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO sessions (duration, startTime, voicePack) VALUES (?, ?, ?);',
          [duration, startTime, voicePack],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const completeSession = async (sessionId: number) => {
  return new Promise<void>((resolve, reject) => {
    const endTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
    const today = format(new Date(), 'yyyy-MM-dd');

    db.transaction(
      (tx) => {
        // Update session as completed
        tx.executeSql(
          'UPDATE sessions SET endTime = ?, completed = 1 WHERE id = ?;',
          [endTime, sessionId]
        );

        // Update or create streak for today
        tx.executeSql(
          `INSERT OR REPLACE INTO streaks (date, sessionsCompleted)
           VALUES (?, COALESCE((SELECT sessionsCompleted + 1 FROM streaks WHERE date = ?), 1));`,
          [today, today]
        );
      },
      (error) => reject(error),
      () => resolve()
    );
  });
};

export const getStreak = async () => {
  return new Promise<number>((resolve, reject) => {
    const today = new Date();
    let streakCount = 0;

    db.transaction(
      (tx) => {
        // Get all streak dates in descending order
        tx.executeSql(
          `SELECT date FROM streaks ORDER BY date DESC;`,
          [],
          (_, result) => {
            let previousDate = today;
            let currentDate = today;

            for (let i = 0; i < result.rows.length; i++) {
              currentDate = new Date(result.rows.item(i).date);

              // Check if current date is consecutive with previous date
              if (isSameDay(currentDate, subDays(previousDate, 1))) {
                streakCount++;
                previousDate = currentDate;
              } else {
                // Break if we find a gap
                break;
              }
            }

            resolve(streakCount);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getTotalPoints = async () => {
  return new Promise<number>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT SUM(duration) as totalPoints
           FROM sessions
           WHERE completed = 1;`,
          [],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0).totalPoints || 0);
            } else {
              resolve(0);
            }
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getLastSessionDate = async () => {
  return new Promise<string | null>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT date FROM streaks ORDER BY date DESC LIMIT 1;`,
          [],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0).date);
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const resetStreak = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM streaks;`,
          [],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};
