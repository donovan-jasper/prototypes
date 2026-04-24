import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('progresspulse.db');

const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS habits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, createdAt TEXT);'
    );
  });
};

const addHabit = (name, description, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO habits (name, description, createdAt) values (?, ?, ?)',
      [name, description, new Date().toISOString()],
      (_, { rowsAffected, insertId }) => {
        if (rowsAffected > 0) callback(insertId);
      }
    );
  });
};

const getHabits = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM habits',
      [],
      (_, { rows: { _array } }) => callback(_array)
    );
  });
};

export { setupDatabase, addHabit, getHabits };
