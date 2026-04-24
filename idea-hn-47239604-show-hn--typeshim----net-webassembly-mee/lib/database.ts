import * as SQLite from 'expo-sqlite';

interface Project {
  id: string;
  name: string;
  code: string;
  wasmBytes?: Uint8Array;
  createdAt: number;
  updatedAt: number;
}

class Database {
  private static instance: Database;
  private db: SQLite.WebSQLDatabase;

  private constructor() {
    this.db = SQLite.openDatabase('typebridge.db');
    this.initializeDatabase();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private initializeDatabase() {
    this.db.transaction(tx => {
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL,
          wasmBytes BLOB,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );
      `);
    });
  }

  public async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const id = Date.now().toString();
    const timestamp = Date.now();

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO projects (id, name, code, wasmBytes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [id, project.name, project.code, project.wasmBytes, timestamp, timestamp],
          (_, result) => {
            resolve({
              id,
              name: project.name,
              code: project.code,
              wasmBytes: project.wasmBytes,
              createdAt: timestamp,
              updatedAt: timestamp
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  public async getProjects(): Promise<Project[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM projects ORDER BY updatedAt DESC',
          [],
          (_, { rows }) => {
            const projects: Project[] = [];
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              projects.push({
                id: item.id,
                name: item.name,
                code: item.code,
                wasmBytes: item.wasmBytes ? new Uint8Array(item.wasmBytes) : undefined,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
              });
            }
            resolve(projects);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  public async getProject(id: string): Promise<Project | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM projects WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const item = rows.item(0);
              resolve({
                id: item.id,
                name: item.name,
                code: item.code,
                wasmBytes: item.wasmBytes ? new Uint8Array(item.wasmBytes) : undefined,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
              });
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

  public async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project> {
    const timestamp = Date.now();

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE projects SET name = ?, code = ?, wasmBytes = ?, updatedAt = ? WHERE id = ?',
          [updates.name, updates.code, updates.wasmBytes, timestamp, id],
          (_, result) => {
            resolve({
              id,
              name: updates.name || '',
              code: updates.code || '',
              wasmBytes: updates.wasmBytes,
              createdAt: 0, // Will be overwritten by actual value
              updatedAt: timestamp
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  public async deleteProject(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM projects WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

export default Database.getInstance();
