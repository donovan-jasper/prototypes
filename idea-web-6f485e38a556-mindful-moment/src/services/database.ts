import * as SQLite from 'expo-sqlite';
import { Moment, User, CompletedMoment, Settings, AnalyticsData } from '../types';

const db = SQLite.openDatabase('flowbreak.db');

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Create tables if they don't exist
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            is_premium INTEGER DEFAULT 0,
            onboarding_completed INTEGER DEFAULT 0
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS moments (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            script TEXT NOT NULL,
            duration INTEGER NOT NULL,
            audio_path TEXT,
            voice_type TEXT,
            is_premium INTEGER DEFAULT 0
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS completed_moments (
            id TEXT PRIMARY KEY,
            moment_id TEXT NOT NULL,
            completed_at TEXT NOT NULL,
            mood_rating INTEGER,
            context TEXT,
            FOREIGN KEY (moment_id) REFERENCES moments (id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            id TEXT PRIMARY KEY,
            quiet_hours_start INTEGER DEFAULT 22,
            quiet_hours_end INTEGER DEFAULT 7,
            preferred_categories TEXT DEFAULT '["Calm","Focus","Energy"]',
            notification_style TEXT DEFAULT 'gentle',
            preferred_voice TEXT DEFAULT 'calm-female'
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS analytics (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            moments_taken INTEGER DEFAULT 0,
            notifications_sent INTEGER DEFAULT 0,
            notifications_ignored INTEGER DEFAULT 0,
            stress_level REAL
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_patterns (
            user_id TEXT PRIMARY KEY,
            active_times TEXT DEFAULT '[]',
            ignored_times TEXT DEFAULT '[]',
            preferred_categories TEXT DEFAULT '["Calm","Focus","Energy"]',
            FOREIGN KEY (user_id) REFERENCES users (id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS scheduled_moments (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            moment_id TEXT NOT NULL,
            scheduled_time TEXT NOT NULL,
            notification_id TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (moment_id) REFERENCES moments (id)
          );`
        );
      },
      error => reject(error),
      () => resolve(true)
    );
  });
};

export const getOrCreateUser = async (): Promise<User> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM users LIMIT 1;',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0));
            } else {
              const newUserId = Date.now().toString();
              const now = new Date().toISOString();

              tx.executeSql(
                'INSERT INTO users (id, created_at) VALUES (?, ?);',
                [newUserId, now],
                () => {
                  tx.executeSql(
                    'SELECT * FROM users WHERE id = ?;',
                    [newUserId],
                    (_, { rows }) => resolve(rows.item(0))
                  );
                }
              );
            }
          }
        );
      },
      error => reject(error)
    );
  });
};

export const getAllMoments = async (): Promise<Moment[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM moments;',
          [],
          (_, { rows }) => {
            const moments: Moment[] = [];
            for (let i = 0; i < rows.length; i++) {
              moments.push(rows.item(i));
            }
            resolve(moments);
          }
        );
      },
      error => reject(error)
    );
  });
};

export const getRandomMoment = async (category?: string): Promise<Moment | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        let query = 'SELECT * FROM moments ORDER BY RANDOM() LIMIT 1;';
        const params: any[] = [];

        if (category) {
          query = 'SELECT * FROM moments WHERE category = ? ORDER BY RANDOM() LIMIT 1;';
          params.push(category);
        }

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0));
            } else {
              resolve(null);
            }
          }
        );
      },
      error => reject(error)
    );
  });
};

export const completeMoment = async (momentId: string, moodRating?: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        const now = new Date().toISOString();
        const completedId = Date.now().toString();

        tx.executeSql(
          'INSERT INTO completed_moments (id, moment_id, completed_at, mood_rating) VALUES (?, ?, ?, ?);',
          [completedId, momentId, now, moodRating || null]
        );

        // Update analytics for today
        const today = new Date().toISOString().split('T')[0];
        tx.executeSql(
          `INSERT OR IGNORE INTO analytics (id, date) VALUES (?, ?);`,
          [today, today]
        );

        tx.executeSql(
          `UPDATE analytics SET moments_taken = moments_taken + 1 WHERE date = ?;`,
          [today]
        );
      },
      error => reject(error),
      () => resolve()
    );
  });
};

export const getUserSettings = async (userId: string): Promise<Settings> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM settings WHERE id = ?;',
          [userId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const settings = rows.item(0);
              // Parse JSON fields
              settings.preferredCategories = JSON.parse(settings.preferred_categories);
              resolve(settings);
            } else {
              // Create default settings
              const defaultSettings = {
                id: userId,
                quietHoursStart: 22,
                quietHoursEnd: 7,
                preferredCategories: ['Calm', 'Focus', 'Energy'],
                notificationStyle: 'gentle',
                preferredVoice: 'calm-female'
              };

              tx.executeSql(
                `INSERT INTO settings (
                  id, quiet_hours_start, quiet_hours_end,
                  preferred_categories, notification_style, preferred_voice
                ) VALUES (?, ?, ?, ?, ?, ?);`,
                [
                  userId,
                  defaultSettings.quietHoursStart,
                  defaultSettings.quietHoursEnd,
                  JSON.stringify(defaultSettings.preferredCategories),
                  defaultSettings.notificationStyle,
                  defaultSettings.preferredVoice
                ],
                () => resolve(defaultSettings)
              );
            }
          }
        );
      },
      error => reject(error)
    );
  });
};

export const getUserPatterns = async (userId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM user_patterns WHERE user_id = ?;',
          [userId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const patterns = rows.item(0);
              // Parse JSON fields
              patterns.activeTimes = JSON.parse(patterns.active_times);
              patterns.ignoredTimes = JSON.parse(patterns.ignored_times);
              patterns.preferredCategories = JSON.parse(patterns.preferred_categories);
              resolve(patterns);
            } else {
              // Create default patterns
              const defaultPatterns = {
                user_id: userId,
                activeTimes: [],
                ignoredTimes: [],
                preferredCategories: ['Calm', 'Focus', 'Energy']
              };

              tx.executeSql(
                `INSERT INTO user_patterns (
                  user_id, active_times, ignored_times, preferred_categories
                ) VALUES (?, ?, ?, ?);`,
                [
                  userId,
                  JSON.stringify(defaultPatterns.activeTimes),
                  JSON.stringify(defaultPatterns.ignoredTimes),
                  JSON.stringify(defaultPatterns.preferredCategories)
                ],
                () => resolve(defaultPatterns)
              );
            }
          }
        );
      },
      error => reject(error)
    );
  });
};

export const logIgnoredNotification = async (userId: string, notificationId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Update analytics
        const today = new Date().toISOString().split('T')[0];
        tx.executeSql(
          `INSERT OR IGNORE INTO analytics (id, date) VALUES (?, ?);`,
          [today, today]
        );

        tx.executeSql(
          `UPDATE analytics SET notifications_ignored = notifications_ignored + 1 WHERE date = ?;`,
          [today]
        );

        // Update user patterns
        tx.executeSql(
          `SELECT ignored_times FROM user_patterns WHERE user_id = ?;`,
          [userId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const ignoredTimes = JSON.parse(rows.item(0).ignored_times);
              const notificationTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

              if (!ignoredTimes.includes(notificationTime)) {
                ignoredTimes.push(notificationTime);
                tx.executeSql(
                  `UPDATE user_patterns SET ignored_times = ? WHERE user_id = ?;`,
                  [JSON.stringify(ignoredTimes), userId]
                );
              }
            }
          }
        );
      },
      error => reject(error),
      () => resolve()
    );
  });
};

export const logEngagedNotification = async (userId: string, notificationId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Update analytics
        const today = new Date().toISOString().split('T')[0];
        tx.executeSql(
          `INSERT OR IGNORE INTO analytics (id, date) VALUES (?, ?);`,
          [today, today]
        );

        tx.executeSql(
          `UPDATE analytics SET notifications_sent = notifications_sent + 1 WHERE date = ?;`,
          [today]
        );

        // Update user patterns
        tx.executeSql(
          `SELECT active_times FROM user_patterns WHERE user_id = ?;`,
          [userId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const activeTimes = JSON.parse(rows.item(0).active_times);
              const notificationTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

              if (!activeTimes.includes(notificationTime)) {
                activeTimes.push(notificationTime);
                tx.executeSql(
                  `UPDATE user_patterns SET active_times = ? WHERE user_id = ?;`,
                  [JSON.stringify(activeTimes), userId]
                );
              }
            }
          }
        );
      },
      error => reject(error),
      () => resolve()
    );
  });
};

export const scheduleMoments = async (userId: string, moments: Moment[], windows: any[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Clear existing scheduled moments for the user
        tx.executeSql(
          'DELETE FROM scheduled_moments WHERE user_id = ?;',
          [userId]
        );

        // Schedule new moments
        moments.forEach((moment, index) => {
          if (index < windows.length) {
            const window = windows[index];
            const scheduledId = Date.now().toString() + index;
            const notificationId = `notification_${scheduledId}`;

            tx.executeSql(
              `INSERT INTO scheduled_moments (
                id, user_id, moment_id, scheduled_time, notification_id
              ) VALUES (?, ?, ?, ?, ?);`,
              [
                scheduledId,
                userId,
                moment.id,
                window.start.toISOString(),
                notificationId
              ]
            );
          }
        });
      },
      error => reject(error),
      () => resolve()
    );
  });
};
