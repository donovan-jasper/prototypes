import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('typebridge.db');

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create projects table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL,
          wasmBytes BLOB,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );`
      );

      // Create compilations cache table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS compilations (
          codeHash TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          wasmBytes BLOB NOT NULL
        );`
      );

      // Create templates table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS templates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          code TEXT NOT NULL,
          category TEXT NOT NULL,
          isPremium INTEGER NOT NULL
        );`
      );
    }, reject, resolve);
  });
}

export async function getProjects() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM projects ORDER BY updatedAt DESC',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
}

export async function createProject(project: any) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO projects (id, name, code, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [project.id, project.name, project.code, Date.now(), Date.now()],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
}

export async function updateProject(project: any) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE projects SET name = ?, code = ?, wasmBytes = ?, updatedAt = ? WHERE id = ?',
        [project.name, project.code, project.wasmBytes, Date.now(), project.id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
}

export async function deleteProject(id: string) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM projects WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
}
