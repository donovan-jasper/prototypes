import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('ideaspark.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Create schema_version table first
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          applied_at TEXT DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Check current schema version
      tx.executeSql(
        'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1',
        [],
        (_, { rows: { _array } }) => {
          const currentVersion = _array.length > 0 ? _array[0].version : 0;

          // Run migrations if needed
          if (currentVersion < 1) {
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS ideas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                upvotes INTEGER DEFAULT 0,
                downvotes INTEGER DEFAULT 0,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
              );`
            );
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ideaId INTEGER NOT NULL,
                comment TEXT NOT NULL,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ideaId) REFERENCES ideas (id)
              );`
            );
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                sparkScore INTEGER DEFAULT 0,
                bio TEXT
              );`
            );
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ideaId INTEGER NOT NULL,
                userId INTEGER NOT NULL,
                voteType TEXT NOT NULL,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ideaId) REFERENCES ideas (id),
                FOREIGN KEY (userId) REFERENCES users (id),
                UNIQUE(ideaId, userId)
              );`
            );
            tx.executeSql(
              'INSERT INTO schema_version (version) VALUES (1)',
              [],
              () => resolve(),
              (_, error) => reject(error)
            );
          } else {
            resolve();
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getDatabase = () => db;
