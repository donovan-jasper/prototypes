import * as SQLite from 'expo-sqlite';
import { Moment, User, Settings, CompletedMoment, AnalyticsData } from '../types';

const db = SQLite.openDatabase('flowbreak.db');

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
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
          description TEXT,
          script TEXT NOT NULL,
          duration INTEGER NOT NULL,
          audio_path TEXT,
          voice_type TEXT,
          is_premium INTEGER DEFAULT 0,
          is_custom INTEGER DEFAULT 0
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS completed_moments (
          id TEXT PRIMARY KEY,
          moment_id TEXT NOT NULL,
          completed_at TEXT NOT NULL,
          mood_rating INTEGER,
          context TEXT,
          FOREIGN KEY (moment_id) REFERENCES moments(id)
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          id TEXT PRIMARY KEY,
          quiet_hours_start INTEGER DEFAULT 22,
          quiet_hours_end INTEGER DEFAULT 8,
          preferred_categories TEXT DEFAULT '["Calm","Focus","Energy"]',
          notification_style TEXT DEFAULT 'gentle',
          preferred_voice TEXT DEFAULT 'Calm Female',
          FOREIGN KEY (id) REFERENCES users(id)
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          moments_taken INTEGER DEFAULT 0,
          notifications_sent INTEGER DEFAULT 0,
          notifications_ignored INTEGER DEFAULT 0,
          stress_level INTEGER
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS scheduled_notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          moment_id TEXT NOT NULL,
          scheduled_time TEXT NOT NULL,
          is_delivered INTEGER DEFAULT 0,
          is_ignored INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (moment_id) REFERENCES moments(id)
        );`
      );

      // Seed initial moments if table is empty
      tx.executeSql(
        `SELECT COUNT(*) as count FROM moments;`,
        [],
        (_, result) => {
          if (result.rows.item(0).count === 0) {
            seedMoments(tx);
          }
        }
      );
    }, error => {
      reject(error);
    }, () => {
      resolve(true);
    });
  });
};

const seedMoments = (tx) => {
  const moments = [
    // Calm moments
    {
      id: 'calm1',
      category: 'Calm',
      title: 'Deep Breathing Exercise',
      description: 'A simple breathing exercise to help you relax',
      script: 'Take a deep breath in through your nose... and slowly exhale through your mouth... Repeat this cycle for 5 minutes...',
      duration: 60,
      audio_path: 'calm-breathing.mp3',
      is_premium: 0
    },
    // Add more moments...
  ];

  moments.forEach(moment => {
    tx.executeSql(
      `INSERT INTO moments (id, category, title, description, script, duration, audio_path, is_premium)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        moment.id,
        moment.category,
        moment.title,
        moment.description,
        moment.script,
        moment.duration,
        moment.audio_path,
        moment.is_premium
      ]
    );
  });
};

export const getOrCreateUser = async (): Promise<User> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM users LIMIT 1;`,
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            const user = result.rows.item(0);
            resolve({
              id: user.id,
              createdAt: new Date(user.created_at),
              isPremium: user.is_premium === 1,
              onboardingCompleted: user.onboarding_completed === 1
            });
          } else {
            const newUserId = Date.now().toString();
            const now = new Date().toISOString();

            tx.executeSql(
              `INSERT INTO users (id, created_at) VALUES (?, ?);`,
              [newUserId, now]
            );

            tx.executeSql(
              `INSERT INTO settings (id) VALUES (?);`,
              [newUserId]
            );

            resolve({
              id: newUserId,
              createdAt: new Date(now),
              isPremium: false,
              onboardingCompleted: false
            });
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getAllMoments = async (): Promise<Moment[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM moments;`,
        [],
        (_, result) => {
          const moments = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            moments.push({
              id: row.id,
              category: row.category,
              title: row.title,
              description: row.description,
              script: row.script,
              duration: row.duration,
              audioPath: row.audio_path,
              voiceType: row.voice_type,
              isPremium: row.is_premium === 1,
              isCustom: row.is_custom === 1
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
};

export const getRandomMoment = async (category?: string): Promise<Moment | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let query = 'SELECT * FROM moments';
      const params = [];

      if (category) {
        query += ' WHERE category = ?';
        params.push(category);
      }

      query += ' ORDER BY RANDOM() LIMIT 1;';

      tx.executeSql(
        query,
        params,
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({
              id: row.id,
              category: row.category,
              title: row.title,
              description: row.description,
              script: row.script,
              duration: row.duration,
              audioPath: row.audio_path,
              voiceType: row.voice_type,
              isPremium: row.is_premium === 1,
              isCustom: row.is_custom === 1
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
};

export const completeMoment = async (momentId: string, moodRating?: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const now = new Date().toISOString();
      const completedId = Date.now().toString();

      tx.executeSql(
        `INSERT INTO completed_moments (id, moment_id, completed_at, mood_rating)
         VALUES (?, ?, ?, ?);`,
        [completedId, momentId, now, moodRating || null]
      );

      // Update analytics
      const today = new Date().toISOString().split('T')[0];
      tx.executeSql(
        `INSERT OR IGNORE INTO analytics (date) VALUES (?);`,
        [today]
      );

      tx.executeSql(
        `UPDATE analytics SET moments_taken = moments_taken + 1 WHERE date = ?;`,
        [today]
      );
    }, error => {
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export const getUserSettings = async (userId: string): Promise<Settings> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM settings WHERE id = ?;`,
        [userId],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({
              id: row.id,
              quietHoursStart: row.quiet_hours_start,
              quietHoursEnd: row.quiet_hours_end,
              preferredCategories: JSON.parse(row.preferred_categories),
              notificationStyle: row.notification_style,
              preferredVoice: row.preferred_voice
            });
          } else {
            // Create default settings if none exist
            tx.executeSql(
              `INSERT INTO settings (id) VALUES (?);`,
              [userId]
            );

            resolve({
              id: userId,
              quietHoursStart: 22,
              quietHoursEnd: 8,
              preferredCategories: ['Calm', 'Focus', 'Energy'],
              notificationStyle: 'gentle',
              preferredVoice: 'Calm Female'
            });
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const updateUserSettings = async (settings: Settings): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE settings SET
          quiet_hours_start = ?,
          quiet_hours_end = ?,
          preferred_categories = ?,
          notification_style = ?,
          preferred_voice = ?
        WHERE id = ?;`,
        [
          settings.quietHoursStart,
          settings.quietHoursEnd,
          JSON.stringify(settings.preferredCategories),
          settings.notificationStyle,
          settings.preferredVoice,
          settings.id
        ]
      );
    }, error => {
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export const getCompletedMoments = async (): Promise<CompletedMoment[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM completed_moments ORDER BY completed_at DESC;`,
        [],
        (_, result) => {
          const completedMoments = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            completedMoments.push({
              id: row.id,
              momentId: row.moment_id,
              completedAt: new Date(row.completed_at),
              moodRating: row.mood_rating,
              context: row.context
            });
          }
          resolve(completedMoments);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getUserPatterns = async (userId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Get ignored notification times
      tx.executeSql(
        `SELECT scheduled_time FROM scheduled_notifications
         WHERE user_id = ? AND is_ignored = 1
         ORDER BY scheduled_time DESC LIMIT 5;`,
        [userId],
        (_, result) => {
          const ignoredTimes = [];
          for (let i = 0; i < result.rows.length; i++) {
            const time = new Date(result.rows.item(i).scheduled_time);
            ignoredTimes.push(time.toTimeString().split(' ')[0]);
          }

          // Get preferred categories from completed moments
          tx.executeSql(
            `SELECT m.category, COUNT(*) as count
             FROM completed_moments cm
             JOIN moments m ON cm.moment_id = m.id
             GROUP BY m.category
             ORDER BY count DESC LIMIT 3;`,
            [],
            (_, result) => {
              const preferredCategories = [];
              for (let i = 0; i < result.rows.length; i++) {
                preferredCategories.push(result.rows.item(i).category);
              }

              resolve({
                activeTimes: [], // Would be populated with actual active times in a real app
                ignoredTimes,
                preferredCategories: preferredCategories.length > 0 ? preferredCategories : ['Calm', 'Focus', 'Energy']
              });
            }
          );
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const logIgnoredNotification = async (userId: string, notificationId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE scheduled_notifications SET is_ignored = 1 WHERE id = ? AND user_id = ?;`,
        [notificationId, userId]
      );

      // Update analytics
      const today = new Date().toISOString().split('T')[0];
      tx.executeSql(
        `INSERT OR IGNORE INTO analytics (date) VALUES (?);`,
        [today]
      );

      tx.executeSql(
        `UPDATE analytics SET notifications_ignored = notifications_ignored + 1 WHERE date = ?;`,
        [today]
      );
    }, error => {
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export const logEngagedNotification = async (userId: string, notificationId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE scheduled_notifications SET is_delivered = 1 WHERE id = ? AND user_id = ?;`,
        [notificationId, userId]
      );

      // Update analytics
      const today = new Date().toISOString().split('T')[0];
      tx.executeSql(
        `INSERT OR IGNORE INTO analytics (date) VALUES (?);`,
        [today]
      );

      tx.executeSql(
        `UPDATE analytics SET notifications_sent = notifications_sent + 1 WHERE date = ?;`,
        [today]
      );
    }, error => {
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export const scheduleNotification = async (userId: string, notificationId: string, momentId: string, time: Date): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO scheduled_notifications (id, user_id, moment_id, scheduled_time)
         VALUES (?, ?, ?, ?);`,
        [notificationId, userId, momentId, time.toISOString()]
      );

      // Update analytics
      const today = new Date().toISOString().split('T')[0];
      tx.executeSql(
        `INSERT OR IGNORE INTO analytics (date) VALUES (?);`,
        [today]
      );

      tx.executeSql(
        `UPDATE analytics SET notifications_sent = notifications_sent + 1 WHERE date = ?;`,
        [today]
      );
    }, error => {
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export const getScheduledMomentsForToday = async (userId: string): Promise<Moment[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      tx.executeSql(
        `SELECT m.* FROM moments m
         JOIN scheduled_notifications sn ON m.id = sn.moment_id
         WHERE sn.user_id = ? AND sn.scheduled_time BETWEEN ? AND ?
         ORDER BY sn.scheduled_time ASC;`,
        [userId, startOfDay, endOfDay],
        (_, result) => {
          const moments = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            moments.push({
              id: row.id,
              category: row.category,
              title: row.title,
              description: row.description,
              script: row.script,
              duration: row.duration,
              audioPath: row.audio_path,
              voiceType: row.voice_type,
              isPremium: row.is_premium === 1,
              isCustom: row.is_custom === 1
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
};

export const createCustomMoment = async (moment: Moment): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO moments (
          id, category, title, description, script, duration, audio_path, is_premium, is_custom
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          moment.id,
          moment.category,
          moment.title,
          moment.description,
          moment.script,
          moment.duration,
          moment.audioPath || null,
          1, // Custom moments are always premium
          1
        ]
      );
    }, error => {
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export const getDailyAnalytics = async (date: Date): Promise<AnalyticsData | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const dateString = date.toISOString().split('T')[0];

      tx.executeSql(
        `SELECT * FROM analytics WHERE date = ?;`,
        [dateString],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({
              date: new Date(row.date),
              momentsTaken: row.moments_taken,
              notificationsSent: row.notifications_sent,
              notificationsIgnored: row.notifications_ignored,
              stressLevel: row.stress_level
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
};

export const getAnalyticsBetweenDates = async (startDate: Date, endDate: Date): Promise<AnalyticsData[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];

      tx.executeSql(
        `SELECT * FROM analytics WHERE date BETWEEN ? AND ? ORDER BY date ASC;`,
        [startDateString, endDateString],
        (_, result) => {
          const analyticsData = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            analyticsData.push({
              date: new Date(row.date),
              momentsTaken: row.moments_taken,
              notificationsSent: row.notifications_sent,
              notificationsIgnored: row.notifications_ignored,
              stressLevel: row.stress_level
            });
          }
          resolve(analyticsData);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
