import * as SQLite from 'expo-sqlite';
import { Entry, Category } from '../types';

const db = SQLite.openDatabase('trackflow.db');

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
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

        // Check if default category exists
        tx.executeSql(
          `SELECT COUNT(*) as count FROM categories;`,
          [],
          (_, result) => {
            const count = result.rows.item(0).count;
            if (count === 0) {
              // Add default Fitness category
              tx.executeSql(
                `INSERT INTO categories (name, icon, color) VALUES (?, ?, ?);`,
                ['Fitness', '💪', '#007AFF']
              );
            }
          }
        );
      },
      (error) => {
        reject(error);
      },
      () => {
        resolve();
      }
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
          if (result.rows.length === 0) {
            resolve(0);
            return;
          }

          // Step 1: Fetch all timestamps
          const timestamps: number[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            timestamps.push(result.rows.item(i).timestamp);
          }

          // Step 2: Convert to date-only format (YYYY-MM-DD strings)
          const dateStrings = timestamps.map(ts => {
            const date = new Date(ts);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          });

          // Step 3: Deduplicate dates
          const uniqueDates = Array.from(new Set(dateStrings));

          // Step 4: Sort in descending order (most recent first)
          uniqueDates.sort((a, b) => b.localeCompare(a));

          // Step 5: Start from today or most recent entry
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          let streak = 0;
          let currentDateStr = uniqueDates[0] === todayStr ? todayStr : uniqueDates[0];

          // Step 6: Count backwards while dates are consecutive
          for (let i = 0; i < uniqueDates.length; i++) {
            if (uniqueDates[i] === currentDateStr) {
              streak++;
              // Calculate previous day
              const currentDate = new Date(currentDateStr);
              currentDate.setDate(currentDate.getDate() - 1);
              currentDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            } else {
              // Step 7: Stop at first gap
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
