import * as SQLite from 'expo-sqlite';
import { format } from 'date-fns';

const db = SQLite.openDatabase('zensprint.db');

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            duration INTEGER,
            startTime TEXT,
            endTime TEXT,
            completed INTEGER,
            voicePack TEXT
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS streaks (
            date TEXT PRIMARY KEY,
            sessionsCompleted INTEGER
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS pods (
            id TEXT PRIMARY KEY,
            name TEXT,
            members TEXT,
            createdAt TEXT
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            pointsRequired INTEGER,
            unlocked INTEGER
          );`
        );
      },
      (error) => reject(error),
      () => resolve(true)
    );
  });
};

export const createSession = async (duration: number, voicePack: string) => {
  return new Promise((resolve, reject) => {
    const startTime = new Date().toISOString();
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO sessions (duration, startTime, completed, voicePack) VALUES (?, ?, ?, ?);',
          [duration, startTime, 0, voicePack],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const completeSession = async (sessionId: number) => {
  return new Promise((resolve, reject) => {
    const endTime = new Date().toISOString();
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE sessions SET endTime = ?, completed = 1 WHERE id = ?;',
          [endTime, sessionId],
          () => resolve(true),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getStreak = async () => {
  return new Promise((resolve, reject) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM streaks ORDER BY date DESC LIMIT 7;',
          [],
          (_, { rows }) => {
            const streaks = rows._array;
            let currentStreak = 0;

            for (let i = 0; i < streaks.length; i++) {
              const streakDate = new Date(streaks[i].date);
              const prevDate = i > 0 ? new Date(streaks[i - 1].date) : new Date(today);

              // Check if dates are consecutive
              if (prevDate.getTime() - streakDate.getTime() === 86400000) {
                currentStreak++;
              } else {
                break;
              }
            }

            resolve(currentStreak);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateStreak = async () => {
  return new Promise((resolve, reject) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO streaks (date, sessionsCompleted) VALUES (?, 1);',
          [today],
          () => resolve(true),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getTotalPoints = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT SUM(duration) as totalPoints FROM sessions WHERE completed = 1;',
          [],
          (_, { rows }) => resolve(rows._array[0].totalPoints || 0),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getCompletedDays = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT DISTINCT date(startTime) as date FROM sessions WHERE completed = 1;',
          [],
          (_, { rows }) => resolve(rows._array.map((row) => row.date)),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getFocusTimeStats = async () => {
  return new Promise((resolve, reject) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const weekAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const monthAgo = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT
            SUM(CASE WHEN date(startTime) = ? THEN duration ELSE 0 END) as today,
            SUM(CASE WHEN date(startTime) >= ? THEN duration ELSE 0 END) as weekly,
            SUM(CASE WHEN date(startTime) >= ? THEN duration ELSE 0 END) as monthly
          FROM sessions WHERE completed = 1;`,
          [today, weekAgo, monthAgo],
          (_, { rows }) => resolve(rows._array[0]),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getCompletionRate = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT
            date(startTime) as date,
            COUNT(*) as total,
            SUM(completed) as completed
          FROM sessions
          GROUP BY date(startTime)
          ORDER BY date(startTime) DESC
          LIMIT 7;`,
          [],
          (_, { rows }) => {
            const data = rows._array.map((row) => ({
              date: row.date,
              rate: Math.round((row.completed / row.total) * 100),
            }));
            resolve(data);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getProductiveHours = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT
            strftime('%H', startTime) as hour,
            COUNT(*) as count
          FROM sessions
          WHERE completed = 1
          GROUP BY hour
          ORDER BY count DESC
          LIMIT 5;`,
          [],
          (_, { rows }) => {
            const data = rows._array.map((row) => ({
              hour: parseInt(row.hour),
              count: row.count,
            }));
            resolve(data);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getUserPods = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM pods;',
          [],
          (_, { rows }) => {
            const pods = rows._array.map((pod) => ({
              ...pod,
              members: JSON.parse(pod.members),
            }));
            resolve(pods);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getRewards = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM rewards;',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const initializeRewards = async () => {
  const rewards = [
    { name: 'Bronze', pointsRequired: 100, unlocked: 0 },
    { name: 'Silver', pointsRequired: 500, unlocked: 0 },
    { name: 'Gold', pointsRequired: 1000, unlocked: 0 },
    { name: 'Diamond', pointsRequired: 2000, unlocked: 0 },
  ];

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        rewards.forEach((reward) => {
          tx.executeSql(
            'INSERT INTO rewards (name, pointsRequired, unlocked) VALUES (?, ?, ?);',
            [reward.name, reward.pointsRequired, reward.unlocked]
          );
        });
      },
      (error) => reject(error),
      () => resolve(true)
    );
  });
};
