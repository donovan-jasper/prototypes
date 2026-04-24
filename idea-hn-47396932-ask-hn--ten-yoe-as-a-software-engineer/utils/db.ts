import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('codeshift.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS learning_paths (id TEXT PRIMARY KEY, title TEXT, steps TEXT, progress REAL);',
          [],
          () => resolve(true),
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const saveLearningPaths = async (paths: any[]) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        paths.forEach(path => {
          tx.executeSql(
            'INSERT OR REPLACE INTO learning_paths (id, title, steps, progress) VALUES (?, ?, ?, ?)',
            [path.id, path.title, JSON.stringify(path.steps), path.progress],
            () => resolve(true),
            (_, error) => reject(error)
          );
        });
      },
      error => reject(error)
    );
  });
};

export const getLearningPaths = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM learning_paths',
          [],
          (_, { rows }) => {
            const paths = rows._array.map((row: any) => ({
              ...row,
              steps: JSON.parse(row.steps)
            }));
            resolve(paths);
          },
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};

export const updateLearningPath = async (pathId: string, steps: any[], progress: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'UPDATE learning_paths SET steps = ?, progress = ? WHERE id = ?',
          [JSON.stringify(steps), progress, pathId],
          () => resolve(true),
          (_, error) => reject(error)
        );
      },
      error => reject(error)
    );
  });
};
