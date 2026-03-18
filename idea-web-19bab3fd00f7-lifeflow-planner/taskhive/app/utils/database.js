import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('taskhive.db');

export const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT, notes TEXT, category TEXT, dueDate TEXT, enableNotification INTEGER, notificationId TEXT);'
    );
  });
};

export const getTasks = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM tasks;',
        [],
        (_, { rows: { _array } }) => {
          const tasks = _array.map(task => ({
            ...task,
            enableNotification: task.enableNotification === 1,
          }));
          resolve(tasks);
        },
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
          'INSERT INTO tasks (id, title, notes, category, dueDate, enableNotification, notificationId) VALUES (?, ?, ?, ?, ?, ?, ?);',
          [
            task.id,
            task.title,
            task.notes,
            task.category,
            task.dueDate || null,
            task.enableNotification ? 1 : 0,
            task.notificationId || null,
          ]
        );
      });
      resolve();
    }, reject);
  });
};
