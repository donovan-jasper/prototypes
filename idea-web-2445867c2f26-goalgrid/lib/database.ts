import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('streakstack.db');

export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create tables if they don't exist
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS habits (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          name TEXT,
          frequency TEXT,
          reminder_time TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS completions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habit_id TEXT,
          date TEXT,
          completed BOOLEAN,
          note TEXT,
          FOREIGN KEY (habit_id) REFERENCES habits (id)
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ai_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          streak_length INTEGER,
          missed_days INTEGER,
          habit_name TEXT,
          user_tone TEXT,
          message TEXT,
          created_at TEXT
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS scheduled_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          type TEXT,
          scheduled_time TEXT,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS user_preferences (
          user_id TEXT PRIMARY KEY,
          coach_tone TEXT DEFAULT 'supportive',
          notification_time TEXT DEFAULT '09:00',
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );
    }, (error) => {
      console.error('Database initialization error:', error);
      reject(error);
    }, () => {
      resolve(true);
    });
  });
}

export async function getUserPreferences(userId: string) {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            // Create default preferences if none exist
            tx.executeSql(
              'INSERT INTO user_preferences (user_id) VALUES (?)',
              [userId],
              () => resolve({ user_id: userId, coach_tone: 'supportive', notification_time: '09:00' }),
              (_, error) => {
                console.error('Error creating default preferences:', error);
                resolve(null);
              }
            );
          }
        },
        (_, error) => {
          console.error('Error fetching user preferences:', error);
          resolve(null);
        }
      );
    });
  });
}

export async function updateUserPreferences(userId: string, preferences: Partial<{
  coachTone: string;
  notificationTime: string;
}>) {
  return new Promise((resolve) => {
    db.transaction(tx => {
      const updates = [];
      const params = [];

      if (preferences.coachTone) {
        updates.push('coach_tone = ?');
        params.push(preferences.coachTone);
      }

      if (preferences.notificationTime) {
        updates.push('notification_time = ?');
        params.push(preferences.notificationTime);
      }

      if (updates.length === 0) {
        resolve(true);
        return;
      }

      params.push(userId);

      tx.executeSql(
        `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`,
        params,
        () => resolve(true),
        (_, error) => {
          console.error('Error updating preferences:', error);
          resolve(false);
        }
      );
    });
  });
}
