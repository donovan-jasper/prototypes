import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('behaviormatch.db');

export const runMigrations = () => {
  db.transaction(tx => {
    // Check if migrations table exists
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => {
        // Run individual migrations
        runMigration(tx, 'add_preferences_to_users', addPreferencesToUsers);
        runMigration(tx, 'add_status_to_matches', addStatusToMatches);
        // Add more migrations as needed
      }
    );
  });
};

const runMigration = (tx, name, migrationFunction) => {
  tx.executeSql(
    'SELECT * FROM migrations WHERE name = ?;',
    [name],
    (_, { rows }) => {
      if (rows.length === 0) {
        migrationFunction(tx);
        tx.executeSql(
          'INSERT INTO migrations (name) VALUES (?);',
          [name]
        );
      }
    }
  );
};

const addPreferencesToUsers = (tx) => {
  tx.executeSql(
    `ALTER TABLE users ADD COLUMN preferences_json TEXT;`
  );
};

const addStatusToMatches = (tx) => {
  tx.executeSql(
    `ALTER TABLE matches ADD COLUMN status TEXT;`
  );
};
