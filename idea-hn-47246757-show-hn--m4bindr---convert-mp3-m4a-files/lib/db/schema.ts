import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('chaptercast.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create audiobooks table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS audiobooks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT,
            duration INTEGER NOT NULL,
            filePath TEXT NOT NULL,
            coverArt TEXT,
            currentPosition INTEGER DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`
        );

        // Create chapters table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS chapters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            audiobookId INTEGER NOT NULL,
            title TEXT NOT NULL,
            startTime INTEGER NOT NULL,
            endTime INTEGER NOT NULL,
            \`order\` INTEGER NOT NULL,
            FOREIGN KEY (audiobookId) REFERENCES audiobooks (id)
          );`
        );

        // Create settings table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT
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
