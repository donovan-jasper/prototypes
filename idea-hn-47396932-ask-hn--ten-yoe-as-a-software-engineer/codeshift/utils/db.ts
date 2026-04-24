import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('codeshift.db');

const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS learning_paths (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, progress INTEGER);',
      [],
      () => console.log('Table created successfully'),
      (_, error) => console.log('Error creating table:', error)
    );
  });
};

const insertLearningPath = (title: string, progress: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO learning_paths (title, progress) VALUES (?, ?);',
      [title, progress],
      (_, result) => console.log('Insert successful:', result),
      (_, error) => console.log('Insert failed:', error)
    );
  });
};

const getLearningPaths = (callback: (paths: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM learning_paths;',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => console.log('Select failed:', error)
    );
  });
};

export { initDB, insertLearningPath, getLearningPaths };
