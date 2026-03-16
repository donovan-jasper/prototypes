import * as SQLite from 'expo-sqlite';
import { Generation } from '../types';

const db = SQLite.openDatabase('credigen.db');

export const initDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS generations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt TEXT NOT NULL,
            imageUri TEXT NOT NULL,
            attribution TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            ethicalScore INTEGER DEFAULT 0
          )`,
          [],
          () => console.log('Table created successfully'),
          (_, error) => {
            console.error('Error creating table:', error);
            reject(error);
            return true;
          }
        );
        
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY,
            totalScore INTEGER DEFAULT 0,
            generationCount INTEGER DEFAULT 0,
            premiumStatus BOOLEAN DEFAULT 0
          )`,
          [],
          () => console.log('User profile table created'),
          (_, error) => {
            console.error('Error creating user profile table:', error);
            reject(error);
            return true;
          }
        );
        
        // Insert default user profile if not exists
        tx.executeSql(
          `INSERT OR IGNORE INTO user_profile (id, totalScore, generationCount, premiumStatus) VALUES (1, 0, 0, 0)`,
          [],
          () => resolve(),
          (_, error) => {
            console.error('Error inserting default user profile:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

export const saveGeneration = async (generation: Omit<Generation, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO generations (prompt, imageUri, attribution, timestamp) VALUES (?, ?, ?, ?)`,
          [generation.prompt, generation.imageUri, JSON.stringify(generation.attribution), generation.timestamp],
          (_, result) => resolve(result.insertId!),
          (_, error) => {
            console.error('Error saving generation:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

export const getGenerations = async (): Promise<Generation[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM generations ORDER BY timestamp DESC`,
          [],
          (_, result) => {
            const generations: Generation[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i) as any;
              generations.push({
                id: row.id,
                prompt: row.prompt,
                imageUri: row.imageUri,
                attribution: JSON.parse(row.attribution),
                timestamp: new Date(row.timestamp),
              });
            }
            resolve(generations);
          },
          (_, error) => {
            console.error('Error getting generations:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

export const updateUserProfile = async (updates: Partial<{ totalScore: number; generationCount: number; premiumStatus: boolean }>) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        let query = 'UPDATE user_profile SET ';
        const values: any[] = [];
        const fields = Object.keys(updates);
        
        fields.forEach((field, index) => {
          if (index > 0) query += ', ';
          query += `${field} = ?`;
          values.push((updates as any)[field]);
        });
        
        query += ' WHERE id = 1';
        values.push(1);
        
        tx.executeSql(
          query,
          values,
          () => resolve(),
          (_, error) => {
            console.error('Error updating user profile:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};

export const getUserProfile = async () => {
  return new Promise<any>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM user_profile WHERE id = 1`,
          [],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error getting user profile:', error);
            reject(error);
            return true;
          }
        );
      },
      error => {
        console.error('Transaction failed:', error);
        reject(error);
      }
    );
  });
};
