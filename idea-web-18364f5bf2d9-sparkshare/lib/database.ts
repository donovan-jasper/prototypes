import * as SQLite from 'expo-sqlite';

let db: SQLite.WebSQLDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.WebSQLDatabase> => {
  if (db) return db;

  db = SQLite.openDatabase('ideaspark.db');

  // Initialize database schema
  await initializeDatabase(db);

  return db;
};

const initializeDatabase = async (db: SQLite.WebSQLDatabase): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create users table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          location TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Create ideas table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ideas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );`
      );

      // Create feedback table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          idea_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          parent_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (idea_id) REFERENCES ideas(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (parent_id) REFERENCES feedback(id)
        );`
      );

      // Create feedback notifications table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS feedback_notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          feedback_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          unread BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (feedback_id) REFERENCES feedback(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );`
      );

      // Create votes table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          idea_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          vote_type TEXT NOT NULL CHECK(vote_type IN ('up', 'down')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (idea_id) REFERENCES ideas(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE(idea_id, user_id)
        );`
      );

      // Create saved ideas table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS saved_ideas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          idea_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (idea_id) REFERENCES ideas(id),
          UNIQUE(user_id, idea_id)
        );`
      );
    }, error => {
      console.error('Database initialization failed:', error);
      reject(error);
    }, () => {
      console.log('Database initialized successfully');
      resolve();
    });
  });
};
