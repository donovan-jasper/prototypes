import * as SQLite from 'expo-sqlite';
import { Entry, Category } from '../types';

const db = SQLite.openDatabase('trackflow.db');

const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        note TEXT,
        photoUri TEXT,
        weather TEXT,
        temperature REAL,
        location TEXT,
        FOREIGN KEY (categoryId) REFERENCES categories (id)
      );`
    );
  });
};

export const addEntry = (entry: Omit<Entry, 'id' | 'timestamp'>): Promise<Entry> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO entries (categoryId, timestamp, note, photoUri, weather, temperature, location)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.categoryId,
          Date.now(),
          entry.note,
          entry.photoUri,
          entry.weather,
          entry.temperature,
          entry.location,
        ],
        (_, result) => {
          const newEntry: Entry = {
            id: result.insertId,
            timestamp: Date.now(),
            ...entry,
          };
          resolve(newEntry);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getEntries = (categoryId: number): Promise<Entry[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM entries WHERE categoryId = ? ORDER BY timestamp DESC`,
        [categoryId],
        (_, { rows }) => {
          const entries: Entry[] = [];
          for (let i = 0; i < rows.length; i++) {
            entries.push(rows.item(i));
          }
          resolve(entries);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getStreakCount = (categoryId: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT timestamp FROM entries WHERE categoryId = ? ORDER BY timestamp DESC`,
        [categoryId],
        (_, { rows }) => {
          if (rows.length === 0) {
            resolve(0);
            return;
          }

          let streak = 1;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const firstEntryDate = new Date(rows.item(0).timestamp);
          firstEntryDate.setHours(0, 0, 0, 0);

          if (firstEntryDate.getTime() !== today.getTime()) {
            resolve(0);
            return;
          }

          for (let i = 1; i < rows.length; i++) {
            const currentDate = new Date(rows.item(i).timestamp);
            currentDate.setHours(0, 0, 0, 0);

            const previousDate = new Date(rows.item(i - 1).timestamp);
            previousDate.setHours(0, 0, 0, 0);

            const diffTime = previousDate.getTime() - currentDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays === 1) {
              streak++;
            } else {
              break;
            }
          }

          resolve(streak);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const addCategory = (category: Omit<Category, 'id'>): Promise<Category> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)`,
        [category.name, category.icon, category.color],
        (_, result) => {
          const newCategory: Category = {
            id: result.insertId,
            ...category,
          };
          resolve(newCategory);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getCategories = (): Promise<Category[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM categories`,
        [],
        (_, { rows }) => {
          const categories: Category[] = [];
          for (let i = 0; i < rows.length; i++) {
            categories.push(rows.item(i));
          }
          resolve(categories);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

initializeDatabase();
