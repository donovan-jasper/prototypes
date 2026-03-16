import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('aura.db');

export const DatabaseService = {
  initialize: async () => {
    return new Promise<void>((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS tasks (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              content TEXT NOT NULL,
              type TEXT NOT NULL CHECK(type IN ('note', 'task', 'reminder')),
              isCompleted INTEGER DEFAULT 0,
              dueDate TEXT,
              isPinned INTEGER DEFAULT 0,
              createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
              updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
              locationData TEXT,
              isPremium INTEGER DEFAULT 0
            );`,
            [],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });
  },
};

export default db;
