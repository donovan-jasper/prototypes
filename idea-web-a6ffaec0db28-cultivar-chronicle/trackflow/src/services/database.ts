import * as SQLite from 'expo-sqlite';
import { Entry, Category } from '../types';

const db = SQLite.openDatabase('trackflow.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT
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

export const addEntry = (entry: Omit<Entry, 'id'>) => {
  return new Promise<Entry>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO entries (categoryId, timestamp, note, photoUri, weather, temperature, location)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
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
          resolve({ ...entry, id: result.insertId });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getEntries = (categoryId: number) => {
  return new Promise<Entry[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM entries WHERE categoryId = ? ORDER BY timestamp DESC;`,
        [categoryId],
        (_, result) => {
          const entries: Entry[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            entries.push(result.rows.item(i));
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

export const getStreakCount = (categoryId: number) => {
  return new Promise<number>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT timestamp FROM entries WHERE categoryId = ? ORDER BY timestamp DESC;`,
        [categoryId],
        (_, result) => {
          let streak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          for (let i = 0; i < result.rows.length; i++) {
            const entryDate = new Date(result.rows.item(i).timestamp);
            entryDate.setHours(0, 0, 0, 0);

            if (entryDate.getTime() === today.getTime() - i * 24 * 60 * 60 * 1000) {
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

export const addCategory = (category: Omit<Category, 'id'>) => {
  return new Promise<Category>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO categories (name, icon, color) VALUES (?, ?, ?);`,
        [category.name, category.icon, category.color],
        (_, result) => {
          resolve({ ...category, id: result.insertId });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getCategories = () => {
  return new Promise<Category[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM categories;`,
        [],
        (_, result) => {
          const categories: Category[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            categories.push(result.rows.item(i));
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
