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
          FOREIGN KEY (moment_id) REFERENCES moments (id)
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
          FOREIGN KEY (id) REFERENCES users (id)
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS analytics (
          id TEXT PRIMARY KEY,
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
          notification_id TEXT,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (moment_id) REFERENCES moments (id)
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
    }, (error) => {
      reject(error);
    }, () => {
      resolve(true);
    });
  });
};

const seedMoments = (tx) => {
  const moments = [
    {
      id: '1',
      category: 'Calm',
      title: 'Deep Breathing Exercise',
      description: 'A simple breathing exercise to help you relax',
      script: 'Take a deep breath in through your nose... and slowly exhale through your mouth... Repeat this cycle for 5 minutes...',
      duration: 60,
      audioPath: 'calm-voice-1/deep-breathing.mp3',
      voiceType: 'Calm Female',
      isPremium: false,
      isCustom: false
    },
    {
      id: '2',
      category: 'Focus',
      title: 'Grounding Technique',
      description: 'Bring your attention to the present moment',
      script: 'Name 5 things you can see... 4 things you can touch... 3 things you can hear... 2 things you can smell... 1 thing you can taste...',
      duration: 45,
      audioPath: 'calm-voice-1/grounding.mp3',
      voiceType: 'Calm Female',
      isPremium: false,
      isCustom: false
    },
    // Add more moments here...
  ];

  moments.forEach(moment => {
    tx.executeSql(
      `INSERT INTO moments (id, category, title, description, script, duration, audio_path, voice_type, is_premium, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        moment.id,
        moment.category,
        moment.title,
        moment.description,
        moment.script,
        moment.duration,
        moment.audioPath,
        moment.voiceType,
        moment.isPremium ? 1 : 0,
        moment.isCustom ? 1 : 0
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
            const userId = Date.now().toString();
            const now = new Date().toISOString();

            tx.executeSql(
              `INSERT INTO users (id, created_at) VALUES (?, ?);`,
              [userId, now],
              () => {
                // Create default settings for the new user
                tx.executeSql(
                  `INSERT INTO settings (id) VALUES (?);`,
                  [userId]
                );

                // Create default patterns for the new user
                tx.executeSql(
                  `INSERT INTO user_patterns (user_id) VALUES (?);`,
                  [userId]
                );

                resolve({
                  id: userId,
                  createdAt: new Date(now),
                  isPremium: false,
                  onboardingCompleted: false
                });
              }
            );
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
      let query = `SELECT * FROM moments`;
      const params = [];

      if (category) {
        query += ` WHERE category = ?`;
        params.push(category);
      }

      query += ` ORDER BY RANDOM() LIMIT 1;`;

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
      const completedId = Date.now().toString();
      const completedAt = new Date().toISOString();

      // Record the completed moment
      tx.executeSql(
        `INSERT INTO completed_moments (id, moment_id, completed_at, mood_rating)
         VALUES (?, ?, ?, ?);`,
        [completedId, momentId, completedAt, moodRating || null]
      );

      // Update analytics for today
      const today = new Date().toISOString().split('T')[0];
      tx.executeSql(
        `SELECT * FROM analytics WHERE date = ?;`,
        [today],
        (_, result) => {
          if (result.rows.length > 0) {
            // Update existing record
            const analyticsId = result.rows.item(0).id;
            const momentsTaken = result.rows.item(0).moments_taken + 1;

            tx.executeSql(
              `UPDATE analytics SET moments_taken = ? WHERE id = ?;`,
              [momentsTaken, analyticsId]
            );
          } else {
            // Create new record
            const analyticsId = Date.now().toString();

            tx.executeSql(
              `INSERT INTO analytics (id, date, moments_taken)
               VALUES (?, ?, ?);`,
              [analyticsId, today, 1]
            );
          }
        }
      );
    }, (error) => {
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
              [userId],
              () => {
                resolve({
                  id: userId,
                  quietHoursStart: 22,
                  quietHoursEnd: 8,
                  preferredCategories: ['Calm', 'Focus', 'Energy'],
                  notificationStyle: 'gentle',
                  preferredVoice: 'Calm Female'
                });
              }
            );
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
        ],
        () => {
          resolve();
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
      tx.executeSql(
        `SELECT * FROM user_patterns WHERE user_id = ?;`,
        [userId],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({
              activeTimes: JSON.parse(row.active_times),
              ignoredTimes: JSON.parse(row.ignored_times),
              preferredCategories: JSON.parse(row.preferred_categories)
            });
          } else {
            resolve({
              activeTimes: [],
              ignoredTimes: [],
              preferredCategories: ['Calm', 'Focus', 'Energy']
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

export const logIgnoredNotification = async (userId: string, notificationId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Update analytics for today
      const today = new Date().toISOString().split('T')[0];
      tx.executeSql(
        `SELECT * FROM analytics WHERE date = ?;`,
        [today],
        (_, result) => {
          if (result.rows.length > 0) {
            // Update existing record
            const analyticsId = result.rows.item(0).id;
            const notificationsIgnored = result.rows.item(0).notifications_ignored + 1;

            tx.executeSql(
              `UPDATE analytics SET notifications_ignored = ? WHERE id = ?;`,
              [notificationsIgnored, analyticsId]
            );
          } else {
            // Create new record
            const analyticsId = Date.now().toString();

            tx.executeSql(
              `INSERT INTO analytics (id, date, notifications_ignored)
               VALUES (?, ?, ?);`,
              [analyticsId, today, 1]
            );
          }
        }
      );

      // Update user patterns
      tx.executeSql(
        `SELECT * FROM user_patterns WHERE user_id = ?;`,
        [userId],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            const ignoredTimes = JSON.parse(row.ignored_times);

            // Get the time from the notification ID
            const time = notificationId.split('_')[2];
            if (!ignoredTimes.includes(time)) {
              ignoredTimes.push(time);

              tx.executeSql(
                `UPDATE user_patterns SET ignored_times = ? WHERE user_id = ?;`,
                [JSON.stringify(ignoredTimes), userId]
              );
            }
          }
        }
      );
    }, (error) => {
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export const logEngagedNotification = async (userId: string, notificationId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Update analytics for today
      const today = new Date().toISOString().split('T')[0];
      tx.executeSql(
        `SELECT * FROM analytics WHERE date = ?;`,
        [today],
        (_, result) => {
          if (result.rows.length > 0) {
            // Update existing record
            const analyticsId = result.rows.item(0).id;
            const notificationsSent = result.rows.item(0).notifications_sent + 1;

            tx.executeSql(
              `UPDATE analytics SET notifications_sent = ? WHERE id = ?;`,
              [notificationsSent, analyticsId]
            );
          } else {
            // Create new record
            const analyticsId = Date.now().toString();

            tx.executeSql(
              `INSERT INTO analytics (id, date, notifications_sent)
               VALUES (?, ?, ?);`,
              [analyticsId, today, 1]
            );
          }
        }
      );

      // Update user patterns
      tx.executeSql(
        `SELECT * FROM user_patterns WHERE user_id = ?;`,
        [userId],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            const activeTimes = JSON.parse(row.active_times);

            // Get the time from the notification ID
            const time = notificationId.split('_')[2];
            if (!activeTimes.includes(time)) {
              activeTimes.push(time);

              tx.executeSql(
                `UPDATE user_patterns SET active_times = ? WHERE user_id = ?;`,
                [JSON.stringify(activeTimes), userId]
              );
            }
          }
        }
      );
    }, (error) => {
      reject(error);
    }, () => {
      resolve();
    });
  });
};

export const scheduleNotification = async (userId: string, notificationId: string, momentId: string, time: Date): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const scheduledId = Date.now().toString();
      const scheduledTime = time.toISOString();

      tx.executeSql(
        `INSERT INTO scheduled_notifications (id, user_id, moment_id, scheduled_time, notification_id)
         VALUES (?, ?, ?, ?, ?);`,
        [scheduledId, userId, momentId, scheduledTime, notificationId],
        () => {
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
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
         WHERE sn.user_id = ? AND sn.scheduled_time BETWEEN ? AND ?;`,
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
        `INSERT INTO moments (id, category, title, description, script, duration, audio_path, voice_type, is_premium, is_custom)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          moment.id,
          moment.category,
          moment.title,
          moment.description,
          moment.script,
          moment.duration,
          moment.audioPath || null,
          moment.voiceType || null,
          moment.isPremium ? 1 : 0,
          1 // is_custom is always true for custom moments
        ],
        () => {
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
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

export const updateUser = async (user: Partial<User>): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const updates = [];
      const params = [];

      if (user.isPremium !== undefined) {
        updates.push('is_premium = ?');
        params.push(user.isPremium ? 1 : 0);
      }

      if (user.onboardingCompleted !== undefined) {
        updates.push('onboarding_completed = ?');
        params.push(user.onboardingCompleted ? 1 : 0);
      }

      if (updates.length > 0) {
        params.push(user.id);

        tx.executeSql(
          `UPDATE users SET ${updates.join(', ')} WHERE id = ?;`,
          params,
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      } else {
        resolve();
      }
    });
  });
};
