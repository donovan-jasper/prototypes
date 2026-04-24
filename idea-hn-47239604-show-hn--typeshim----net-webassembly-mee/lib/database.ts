import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('typebridge.db');

export interface Project {
  id: string;
  name: string;
  code: string;
  wasmBytes?: Uint8Array;
  createdAt: number;
  updatedAt: number;
}

export async function initDatabase(): Promise<void> {
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

      // Add any additional tables or migrations here
    }, reject, resolve);
  });
}

export async function getProjectById(id: string): Promise<Project | null> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM projects WHERE id = ?',
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            const project = rows.item(0);
            // Convert wasmBytes from base64 string to Uint8Array if it exists
            if (project.wasmBytes) {
              project.wasmBytes = new Uint8Array(
                atob(project.wasmBytes)
                  .split('')
                  .map(c => c.charCodeAt(0))
              );
            }
            resolve(project);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

export async function saveProject(project: Project): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Convert wasmBytes to base64 string for storage
      const wasmBytes = project.wasmBytes
        ? btoa(String.fromCharCode.apply(null, project.wasmBytes))
        : null;

      tx.executeSql(
        `INSERT OR REPLACE INTO projects
        (id, name, code, wasmBytes, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          project.id,
          project.name,
          project.code,
          wasmBytes,
          project.createdAt,
          project.updatedAt || Date.now()
        ],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

// Other existing database functions...
