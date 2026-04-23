import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('ideaspark.db');

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create users table if not exists
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          location TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => {
          // Create skills table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS skills (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              skill_name TEXT NOT NULL,
              proficiency INTEGER DEFAULT 3,
              FOREIGN KEY(user_id) REFERENCES users(id)
            );`,
            [],
            () => {
              // Create preferences table
              tx.executeSql(
                `CREATE TABLE IF NOT EXISTS preferences (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER NOT NULL,
                  preference_type TEXT NOT NULL,
                  preference_value TEXT NOT NULL,
                  FOREIGN KEY(user_id) REFERENCES users(id)
                );`,
                [],
                () => {
                  // Create matches table
                  tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS matches (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      user1_id INTEGER NOT NULL,
                      user2_id INTEGER NOT NULL,
                      idea_id INTEGER,
                      match_score REAL NOT NULL,
                      status TEXT DEFAULT 'pending',
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY(user1_id) REFERENCES users(id),
                      FOREIGN KEY(user2_id) REFERENCES users(id),
                      FOREIGN KEY(idea_id) REFERENCES ideas(id)
                    );`,
                    [],
                    () => {
                      // Create messages table
                      tx.executeSql(
                        `CREATE TABLE IF NOT EXISTS messages (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          match_id INTEGER NOT NULL,
                          sender_id INTEGER NOT NULL,
                          content TEXT NOT NULL,
                          read_status INTEGER DEFAULT 0,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY(match_id) REFERENCES matches(id),
                          FOREIGN KEY(sender_id) REFERENCES users(id)
                        );`,
                        [],
                        () => resolve(),
                        (_, error) => reject(error)
                      );
                    },
                    (_, error) => reject(error)
                  );
                },
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getDatabase = () => db;
