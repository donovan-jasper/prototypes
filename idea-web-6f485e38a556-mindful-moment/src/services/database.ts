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
          (_, error) => {
            reject(error);
            return false;
          }
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
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
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
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
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
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateUserSettings(userId: string, settings: UserSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO settings
          (id, user_id, quiet_hours_start, quiet_hours_end, preferred_categories, notification_style, voice_type)
          VALUES (
            (SELECT id FROM settings WHERE user_id = ?),
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          );`,
          [
            userId,
            userId,
            settings.quietHours.start,
            settings.quietHours.end,
            JSON.stringify(settings.preferredCategories),
            settings.notificationStyle,
            settings.voiceType
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getMomentsByCategory(category: string, isPremium: boolean): Promise<Moment[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM moments WHERE category = ? AND is_premium <= ?;',
          [category, isPremium ? 1 : 0],
          (_, { rows }) => {
            const moments: Moment[] = [];
            for (let i = 0; i < rows.length; i++) {
              const moment = rows.item(i);
              moments.push({
                id: moment.id,
                category: moment.category,
                title: moment.title,
                description: moment.description,
                duration: moment.duration,
                audioPath: moment.audio_path,
                voiceType: moment.voice_type,
                isPremium: moment.is_premium === 1
              });
            }
            resolve(moments);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async logCompletedMoment(userId: string, momentId: string, moodRating?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO completed_moments (user_id, moment_id, completed_at, mood_rating) VALUES (?, ?, ?, ?);',
          [userId, momentId, new Date().toISOString(), moodRating || null],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getStreak(userId: string): Promise<{ currentStreak: number, lastCompleted: Date } | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM streaks WHERE user_id = ?;',
          [userId],
          (_, { rows }) => {
            if (rows.length > 0) {
              const streak = rows.item(0);
              resolve({
                currentStreak: streak.current_streak,
                lastCompleted: new Date(streak.last_completed)
              });
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateStreak(userId: string, streak: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO streaks
          (id, user_id, current_streak, last_completed)
          VALUES (
            (SELECT id FROM streaks WHERE user_id = ?),
            ?,
            ?,
            ?
          );`,
          [userId, userId, streak, new Date().toISOString()],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getScheduledMoments(userId: string): Promise<ScheduledMoment[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM scheduled_moments WHERE user_id = ? ORDER BY scheduled_time ASC;',
          [userId],
          (_, { rows }) => {
            const moments: ScheduledMoment[] = [];
            for (let i = 0; i < rows.length; i++) {
              const moment = rows.item(i);
              moments.push({
                id: moment.id,
                userId: moment.user_id,
                momentId: moment.moment_id,
                scheduledTime: new Date(moment.scheduled_time)
              });
            }
            resolve(moments);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async scheduleMoment(userId: string, momentId: string, scheduledTime: Date): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO scheduled_moments (user_id, moment_id, scheduled_time) VALUES (?, ?, ?);',
          [userId, momentId, scheduledTime.toISOString()],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async clearScheduledMoments(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM scheduled_moments WHERE user_id = ?;',
          [userId],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async logNotification(userId: string, momentId: string, scheduledTime: Date): Promise<string> {
    const notificationId = `${userId}-${Date.now()}`;
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO notifications (id, user_id, moment_id, scheduled_time) VALUES (?, ?, ?, ?);',
          [notificationId, userId, momentId, scheduledTime.toISOString()],
          () => resolve(notificationId),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async markNotificationSent(notificationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE notifications SET was_sent = 1 WHERE id = ?;',
          [notificationId],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async markNotificationEngaged(notificationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE notifications SET was_engaged = 1 WHERE id = ?;',
          [notificationId],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}
