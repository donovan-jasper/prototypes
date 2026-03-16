import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('taskhive.db');

export const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, notes TEXT, category TEXT);'
    );
  });
};

export const getTasks = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tasks;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveTasks = (tasks) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM tasks;');
      tasks.forEach(task => {
        tx.executeSql(
          'INSERT INTO tasks (title, notes, category) VALUES (?, ?, ?);',
          [task.title, task.notes, task.category]
        );
      });
      resolve();
    }, reject);
  });
};
