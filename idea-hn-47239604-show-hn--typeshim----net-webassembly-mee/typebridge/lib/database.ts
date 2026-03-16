import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('typebridge.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            wasmBytes BLOB,
            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL
          );`,
          [],
          () => resolve(db),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getProjects = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM projects ORDER BY updatedAt DESC;',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const createProject = async (project) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO projects (id, name, code, wasmBytes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?);',
          [project.id, project.name, project.code, project.wasmBytes, project.createdAt, project.updatedAt],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const updateProject = async (project) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE projects SET name = ?, code = ?, wasmBytes = ?, updatedAt = ? WHERE id = ?;',
          [project.name, project.code, project.wasmBytes, project.updatedAt, project.id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const deleteProject = async (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM projects WHERE id = ?;',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};
