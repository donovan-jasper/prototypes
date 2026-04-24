import * as SQLite from 'expo-sqlite';
import { Repository } from '../../types/repository';

export class DatabaseService {
  private static db: SQLite.WebSQLDatabase;

  static async initialize(): Promise<void> {
    this.db = SQLite.openDatabase('gitflow.db');

    await new Promise<void>((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Create repositories table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS repositories (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              fullName TEXT NOT NULL,
              description TEXT,
              cloneUrl TEXT NOT NULL,
              defaultBranch TEXT NOT NULL,
              lastUpdated TEXT NOT NULL,
              path TEXT NOT NULL
            );
          `);

          // Create commits table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS commits (
              id TEXT PRIMARY KEY,
              repoId TEXT NOT NULL,
              hash TEXT NOT NULL,
              message TEXT NOT NULL,
              authorName TEXT NOT NULL,
              authorEmail TEXT NOT NULL,
              date TEXT NOT NULL,
              FOREIGN KEY (repoId) REFERENCES repositories(id)
            );
          `);

          // Create branches table
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS branches (
              id TEXT PRIMARY KEY,
              repoId TEXT NOT NULL,
              name TEXT NOT NULL,
              commitHash TEXT NOT NULL,
              isRemote BOOLEAN NOT NULL,
              FOREIGN KEY (repoId) REFERENCES repositories(id)
            );
          `);
        },
        (error) => {
          console.error('Database initialization failed:', error);
          reject(error);
        },
        () => {
          resolve();
        }
      );
    });
  }

  static async saveRepository(repo: Repository): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'INSERT OR REPLACE INTO repositories (id, name, fullName, description, cloneUrl, defaultBranch, lastUpdated, path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [repo.id, repo.name, repo.fullName, repo.description, repo.cloneUrl, repo.defaultBranch, repo.lastUpdated, repo.path],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (error) => {
          console.error('Failed to save repository:', error);
          reject(error);
        }
      );
    });
  }

  static async deleteRepository(repoId: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Delete related commits and branches first
          tx.executeSql('DELETE FROM commits WHERE repoId = ?', [repoId]);
          tx.executeSql('DELETE FROM branches WHERE repoId = ?', [repoId]);

          // Then delete the repository
          tx.executeSql('DELETE FROM repositories WHERE id = ?', [repoId]);
        },
        (error) => {
          console.error('Failed to delete repository:', error);
          reject(error);
        },
        () => resolve()
      );
    });
  }

  static async getRepository(repoId: string): Promise<Repository | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM repositories WHERE id = ?',
            [repoId],
            (_, { rows }) => {
              if (rows.length > 0) {
                resolve(rows.item(0) as Repository);
              } else {
                resolve(null);
              }
            },
            (_, error) => reject(error)
          );
        },
        (error) => {
          console.error('Failed to get repository:', error);
          reject(error);
        }
      );
    });
  }

  static async getAllRepositories(): Promise<Repository[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM repositories',
            [],
            (_, { rows }) => {
              const repositories: Repository[] = [];
              for (let i = 0; i < rows.length; i++) {
                repositories.push(rows.item(i) as Repository);
              }
              resolve(repositories);
            },
            (_, error) => reject(error)
          );
        },
        (error) => {
          console.error('Failed to get all repositories:', error);
          reject(error);
        }
      );
    });
  }
}
