import * as SQLite from 'expo-sqlite';

const openDatabase = () => {
  const db = SQLite.openDatabase('raccoonai.db');
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);'
    );
    // New table for task chains
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS task_chains (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, tasks TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);'
    );
  });
  return db;
};

const db = openDatabase();

const addTaskChain = (name, tasksArray) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO task_chains (name, tasks) VALUES (?, ?);',
          [name, JSON.stringify(tasksArray)],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error),
      () => console.log('Task chain added successfully')
    );
  });
};

const getTaskChains = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM task_chains ORDER BY created_at DESC;',
          [],
          (_, { rows }) => {
            const taskChains = rows._array.map(row => ({
              ...row,
              tasks: JSON.parse(row.tasks) // Parse the JSON string back to an array
            }));
            resolve(taskChains);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error),
      () => console.log('Task chains retrieved successfully')
    );
  });
};

export { openDatabase, addTaskChain, getTaskChains };
