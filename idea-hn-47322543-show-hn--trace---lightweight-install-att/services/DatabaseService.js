import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('linkluminate.db');

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Create installs table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS installs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            timestamp INTEGER NOT NULL
          );`,
          [],
          () => {
            console.log('Installs table created successfully');
          },
          (_, error) => {
            console.error('Error creating installs table:', error);
            return false;
          }
        );

        // Create deep_links table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS deep_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            clicks INTEGER DEFAULT 0
          );`,
          [],
          () => {
            console.log('Deep links table created successfully');
          },
          (_, error) => {
            console.error('Error creating deep_links table:', error);
            return false;
          }
        );
      },
      error => {
        console.error('Transaction error:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

export { db, initializeDatabase };
