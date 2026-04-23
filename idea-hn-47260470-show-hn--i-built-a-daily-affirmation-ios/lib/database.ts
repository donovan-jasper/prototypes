import * as SQLite from 'expo-sqlite';
import { format, differenceInDays, isSameWeek, startOfWeek, endOfWeek } from 'date-fns';

const db = SQLite.openDatabase('motimorph.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS affirmations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          category TEXT NOT NULL,
          time_of_day TEXT NOT NULL,
          energy_level INTEGER NOT NULL
        );`,
        [],
        () => resolve(true),
        (_, error) => reject(error)
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          affirmation_id INTEGER,
          mood_rating INTEGER,
          streak_count INTEGER,
          FOREIGN KEY (affirmation_id) REFERENCES affirmations(id)
        );`,
        [],
        () => resolve(true),
        (_, error) => reject(error)
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active INTEGER DEFAULT 1
        );`,
        [],
        () => resolve(true),
        (_, error) => reject(error)
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS streaks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          is_grace_day INTEGER DEFAULT 0,
          streak_count INTEGER NOT NULL,
          UNIQUE(date)
        );`,
        [],
        () => resolve(true),
        (_, error) => reject(error)
      );
    });
  });
};

export const seedAffirmations = async (affirmations: any[]) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Check if table is empty
      tx.executeSql(
        'SELECT COUNT(*) as count FROM affirmations',
        [],
        (_, { rows }) => {
          if (rows._array[0].count === 0) {
            // Insert seed data
            affirmations.forEach(affirmation => {
              tx.executeSql(
                'INSERT INTO affirmations (text, category, time_of_day, energy_level) VALUES (?, ?, ?, ?)',
                [affirmation.text, affirmation.category, affirmation.time_of_day, affirmation.energy_level]
              );
            });
          }
          resolve(true);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const logUserSession = async (affirmationId: number, moodRating: number, streakCount: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO user_sessions (affirmation_id, mood_rating, streak_count) VALUES (?, ?, ?)',
        [affirmationId, moodRating, streakCount],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getCurrentStreak = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT streak_count FROM streaks ORDER BY date DESC LIMIT 1',
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows._array[0].streak_count);
          } else {
            resolve(0);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getStreakData = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM streaks ORDER BY date ASC',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateStreak = async (date: string, isGraceDay: boolean, streakCount: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Check if record for this date exists
      tx.executeSql(
        'SELECT * FROM streaks WHERE date = ?',
        [date],
        (_, { rows }) => {
          if (rows.length > 0) {
            // Update existing record
            tx.executeSql(
              'UPDATE streaks SET is_grace_day = ?, streak_count = ? WHERE date = ?',
              [isGraceDay ? 1 : 0, streakCount, date],
              (_, result) => resolve(result.rowsAffected),
              (_, error) => reject(error)
            );
          } else {
            // Insert new record
            tx.executeSql(
              'INSERT INTO streaks (date, is_grace_day, streak_count) VALUES (?, ?, ?)',
              [date, isGraceDay ? 1 : 0, streakCount],
              (_, result) => resolve(result.insertId),
              (_, error) => reject(error)
            );
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getGraceDaysUsedThisWeek = async (date: Date) => {
  const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(date), 'yyyy-MM-dd');

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM streaks WHERE is_grace_day = 1 AND date BETWEEN ? AND ?',
        [weekStart, weekEnd],
        (_, { rows }) => {
          resolve(rows._array[0].count);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const canUseGraceDay = async (date: Date) => {
  const graceDaysUsed = await getGraceDaysUsedThisWeek(date);
  return graceDaysUsed < 2;
};

export const getLastStreakDate = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT date FROM streaks ORDER BY date DESC LIMIT 1',
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows._array[0].date);
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const calculateStreakWithGraceDays = async (date: Date) => {
  const lastStreakDate = await getLastStreakDate();
  const today = format(date, 'yyyy-MM-dd');

  if (!lastStreakDate) {
    // First session ever
    return { streakCount: 1, isGraceDay: false };
  }

  const daysDiff = differenceInDays(date, new Date(lastStreakDate));

  if (daysDiff === 1) {
    // Consecutive day
    const currentStreak = await getCurrentStreak();
    return { streakCount: currentStreak + 1, isGraceDay: false };
  } else if (daysDiff > 1 && daysDiff <= 3 && await canUseGraceDay(date)) {
    // Grace day used
    const currentStreak = await getCurrentStreak();
    return { streakCount: currentStreak + 1, isGraceDay: true };
  } else {
    // Streak broken
    return { streakCount: 1, isGraceDay: false };
  }
};
