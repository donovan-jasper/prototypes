import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('appvista.db');

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create analytics table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id TEXT NOT NULL,
            date TEXT NOT NULL,
            sales INTEGER,
            downloads INTEGER,
            ratings REAL,
            reviews_count INTEGER,
            FOREIGN KEY (app_id) REFERENCES apps(id)
          );`
        );

        // Create reviews table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id TEXT NOT NULL,
            review_id TEXT UNIQUE NOT NULL,
            author TEXT,
            rating INTEGER,
            title TEXT,
            body TEXT,
            date TEXT,
            is_responded BOOLEAN DEFAULT 0,
            FOREIGN KEY (app_id) REFERENCES apps(id)
          );`
        );

        // Create responses table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_id TEXT NOT NULL,
            response_text TEXT NOT NULL,
            date TEXT NOT NULL,
            is_ai_generated BOOLEAN DEFAULT 0,
            FOREIGN KEY (review_id) REFERENCES reviews(review_id)
          );`
        );

        // Create apps table (for multi-app support)
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS apps (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            bundle_id TEXT NOT NULL UNIQUE,
            icon_url TEXT,
            last_updated TEXT
          );`
        );
      },
      (error) => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve(true);
      }
    );
  });
};

// Helper functions for common operations
export const addApp = (appData) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO apps (id, name, bundle_id, icon_url, last_updated) VALUES (?, ?, ?, ?, ?)',
          [appData.id, appData.name, appData.bundle_id, appData.icon_url, new Date().toISOString()],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getApps = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM apps ORDER BY last_updated DESC',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};
