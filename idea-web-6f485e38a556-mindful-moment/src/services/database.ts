import * as SQLite from 'expo-sqlite';
import { Moment } from '../types';

interface UserPattern {
  activeTimes: string[];
  ignoredTimes: string[];
  preferredCategories: string[];
  dailyMoments: number;
  lastEngagement: Date | null;
}

interface ScheduledMoment {
  id: string;
  userId: string;
  momentId: string;
  scheduledTime: Date;
}

interface Notification {
  id: string;
  userId: string;
  momentId: string;
  scheduledTime: Date;
  wasSent: boolean;
  wasEngaged: boolean;
}

interface CompletedMoment {
  id: string;
  userId: string;
  momentId: string;
  completedAt: Date;
  moodRating?: number;
}

interface UserSettings {
  id: string;
  userId: string;
  quietHours: { start: number, end: number };
  preferredCategories: string[];
  notificationStyle: 'gentle' | 'direct';
  voiceType: string;
}

export class DatabaseService {
  private db: SQLite.WebSQLDatabase;

  constructor() {
    this.db = SQLite.openDatabase('flowbreak.db');
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.transaction(tx => {
      // Create users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          premium_status INTEGER DEFAULT 0,
          onboarding_completed INTEGER DEFAULT 0
        );`
      );

      // Create moments table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS moments (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          duration INTEGER NOT NULL,
          audio_path TEXT,
          voice_type TEXT,
          is_premium INTEGER DEFAULT 0
        );`
      );

      // Create completed_moments table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS completed_moments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          moment_id TEXT NOT NULL,
          completed_at TEXT NOT NULL,
          mood_rating INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (moment_id) REFERENCES moments(id)
        );`
      );

      // Create settings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          quiet_hours_start INTEGER NOT NULL,
          quiet_hours_end INTEGER NOT NULL,
          preferred_categories TEXT NOT NULL,
          notification_style TEXT NOT NULL,
          voice_type TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );`
      );

      // Create user_patterns table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS user_patterns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          active_times TEXT NOT NULL,
          ignored_times TEXT NOT NULL,
          preferred_categories TEXT NOT NULL,
          daily_moments INTEGER NOT NULL,
          last_engagement TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );`
      );

      // Create scheduled_moments table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS scheduled_moments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          moment_id TEXT NOT NULL,
          scheduled_time TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (moment_id) REFERENCES moments(id)
        );`
      );

      // Create notifications table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          moment_id TEXT NOT NULL,
          scheduled_time TEXT NOT NULL,
          was_sent INTEGER DEFAULT 0,
          was_engaged INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (moment_id) REFERENCES moments(id)
        );`
      );

      // Create streaks table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS streaks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          current_streak INTEGER NOT NULL,
          last_completed TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );`
      );
    });
  }

  async getUserPatterns(userId: string): Promise<UserPattern | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM user_patterns WHERE user_id = ?;',
          [userId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const pattern = rows.item(0);
              resolve({
                activeTimes: JSON.parse(pattern.active_times),
                ignoredTimes: JSON.parse(pattern.ignored_times),
                preferredCategories: JSON.parse(pattern.preferred_categories),
                dailyMoments: pattern.daily_moments,
                lastEngagement: pattern.last_engagement ? new Date(pattern.last_engagement) : null
              });
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async updateUserPatterns(userId: string, patterns: UserPattern): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO user_patterns
          (id, user_id, active_times, ignored_times, preferred_categories, daily_moments, last_engagement)
          VALUES (
            (SELECT id FROM user_patterns WHERE user_id = ?),
            ?, ?, ?, ?, ?, ?
          );`,
          [
            userId,
            userId,
            JSON.stringify(patterns.activeTimes),
            JSON.stringify(patterns.ignoredTimes),
            JSON.stringify(patterns.preferredCategories),
            patterns.dailyMoments,
            patterns.lastEngagement ? patterns.lastEngagement.toISOString() : null
          ],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getAllMoments(): Promise<Moment[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM moments;',
          [],
          (_, { rows }) => {
            const moments: Moment[] = [];
            for (let i = 0; i < rows.length; i++) {
              moments.push(rows.item(i));
            }
            resolve(moments);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async getRandomMoment(category?: string): Promise<Moment | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        let query = 'SELECT * FROM moments';
        const params: any[] = [];

        if (category) {
          query += ' WHERE category = ?';
          params.push(category);
        }

        query += ' ORDER BY RANDOM() LIMIT 1;';

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async completeMoment(momentId: string, moodRating?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        // Insert completed moment
        tx.executeSql(
          'INSERT INTO completed_moments (user_id, moment_id, completed_at, mood_rating) VALUES (?, ?, ?, ?);',
          ['user1', momentId, new Date().toISOString(), moodRating || null],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getScheduledMomentsForToday(userId: string): Promise<Moment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT m.* FROM moments m
           JOIN scheduled_moments sm ON m.id = sm.moment_id
           WHERE sm.user_id = ? AND sm.scheduled_time >= ? AND sm.scheduled_time < ?;`,
          [userId, today.toISOString(), tomorrow.toISOString()],
          (_, { rows }) => {
            const moments: Moment[] = [];
            for (let i = 0; i < rows.length; i++) {
              moments.push(rows.item(i));
            }
            resolve(moments);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async clearScheduledMomentsForToday(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM scheduled_moments WHERE user_id = ? AND scheduled_time >= ? AND scheduled_time < ?;',
          [userId, today.toISOString(), tomorrow.toISOString()],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  async scheduleMomentForToday(userId: string, momentId: string, scheduledTime: Date): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO scheduled_moments (user_id, moment_id, scheduled_time) VALUES (?, ?, ?);',
          [userId, momentId, scheduledTime.toISOString()],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  async scheduleNotification(userId: string, notificationId: string, momentId: string, scheduledTime: Date): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO notifications (id, user_id, moment_id, scheduled_time) VALUES (?, ?, ?, ?);',
          [notificationId, userId, momentId, scheduledTime.toISOString()],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  async logEngagedNotification(notificationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE notifications SET was_engaged = 1 WHERE id = ?;',
          [notificationId],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  async logDismissedNotification(notificationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE notifications SET was_sent = 1 WHERE id = ?;',
          [notificationId],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  async getUserSettings(userId: string): Promise<UserSettings> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM settings WHERE user_id = ?;',
          [userId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const settings = rows.item(0);
              resolve({
                id: settings.id,
                userId: settings.user_id,
                quietHours: {
                  start: settings.quiet_hours_start,
                  end: settings.quiet_hours_end
                },
                preferredCategories: JSON.parse(settings.preferred_categories),
                notificationStyle: settings.notification_style,
                voiceType: settings.voice_type
              });
            } else {
              // Return default settings if none exist
              resolve({
                id: '',
                userId,
                quietHours: { start: 22, end: 8 },
                preferredCategories: ['Calm', 'Focus', 'Energy'],
                notificationStyle: 'gentle',
                voiceType: 'calm'
              });
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async getCurrentStreak(userId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT current_streak FROM streaks WHERE user_id = ?;',
          [userId],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0).current_streak);
            } else {
              resolve(0);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  async updateStreak(userId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        // Get last completed moment
        tx.executeSql(
          'SELECT completed_at FROM completed_moments WHERE user_id = ? ORDER BY completed_at DESC LIMIT 1;',
          [userId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const lastCompleted = new Date(rows.item(0).completed_at);
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              // Check if last completed was yesterday or today
              if (lastCompleted >= today) {
                // Update existing streak
                tx.executeSql(
                  `INSERT OR REPLACE INTO streaks
                  (id, user_id, current_streak, last_completed)
                  VALUES (
                    (SELECT id FROM streaks WHERE user_id = ?),
                    ?, COALESCE((SELECT current_streak FROM streaks WHERE user_id = ?), 0) + 1, ?
                  );`,
                  [userId, userId, userId, new Date().toISOString()],
                  () => {
                    // Get the updated streak
                    tx.executeSql(
                      'SELECT current_streak FROM streaks WHERE user_id = ?;',
                      [userId],
                      (_, { rows }) => {
                        resolve(rows.item(0).current_streak);
                      },
                      (_, error) => reject(error)
                    );
                  },
                  (_, error) => reject(error)
                );
              } else {
                // Reset streak to 1
                tx.executeSql(
                  `INSERT OR REPLACE INTO streaks
                  (id, user_id, current_streak, last_completed)
                  VALUES (
                    (SELECT id FROM streaks WHERE user_id = ?),
                    ?, 1, ?
                  );`,
                  [userId, userId, new Date().toISOString()],
                  () => resolve(1),
                  (_, error) => reject(error)
                );
              }
            } else {
              // First moment ever - start streak
              tx.executeSql(
                'INSERT INTO streaks (user_id, current_streak, last_completed) VALUES (?, 1, ?);',
                [userId, new Date().toISOString()],
                () => resolve(1),
                (_, error) => reject(error)
              );
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }
}
