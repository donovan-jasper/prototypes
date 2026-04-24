import * as SQLite from 'expo-sqlite';
import { Word } from './vocabulary';

const db = SQLite.openDatabase('vocavault.db');

export interface WordProgress {
  id?: number;
  wordId: number;
  lastReviewed?: number;
  nextReview?: number;
  difficulty?: number;
  stability?: number;
  retrievability?: number;
  correctCount?: number;
  incorrectCount?: number;
}

export interface Settings {
  notificationsEnabled: boolean;
  notificationTime?: number;
  dailyGoal: number;
  currentLanguage: string;
}

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            translation TEXT NOT NULL,
            frequency INTEGER NOT NULL,
            category TEXT,
            example TEXT,
            audioUrl TEXT,
            imageUrl TEXT
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wordId INTEGER NOT NULL,
            lastReviewed INTEGER,
            nextReview INTEGER,
            difficulty REAL DEFAULT 2.5,
            stability REAL DEFAULT 1,
            retrievability REAL DEFAULT 0.5,
            correctCount INTEGER DEFAULT 0,
            incorrectCount INTEGER DEFAULT 0,
            FOREIGN KEY (wordId) REFERENCES words (id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            notificationsEnabled INTEGER DEFAULT 1,
            notificationTime INTEGER,
            dailyGoal INTEGER DEFAULT 10,
            currentLanguage TEXT DEFAULT 'spanish'
          );`
        );

        // Initialize settings if empty
        tx.executeSql(
          'SELECT * FROM settings',
          [],
          (_, { rows }) => {
            if (rows.length === 0) {
              tx.executeSql(
                'INSERT INTO settings (notificationsEnabled, dailyGoal, currentLanguage) VALUES (?, ?, ?)',
                [1, 10, 'spanish']
              );
            }
          }
        );
      },
      (error) => reject(error),
      () => resolve(true)
    );
  });
};

export const addWord = async (word: Word) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO words (word, translation, frequency, category, example, audioUrl, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [word.word, word.translation, word.frequency, word.category, word.example, word.audioUrl, word.imageUrl],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getWordById = async (id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM words WHERE id = ?',
          [id],
          (_, { rows }) => resolve(rows._array[0]),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateProgress = async (wordId: number, progress: WordProgress) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Check if progress record exists
        tx.executeSql(
          'SELECT * FROM user_progress WHERE wordId = ?',
          [wordId],
          (_, { rows }) => {
            if (rows.length > 0) {
              // Update existing record
              tx.executeSql(
                `UPDATE user_progress
                 SET lastReviewed = ?, nextReview = ?, difficulty = ?, stability = ?, retrievability = ?, correctCount = ?, incorrectCount = ?
                 WHERE wordId = ?`,
                [
                  progress.lastReviewed,
                  progress.nextReview,
                  progress.difficulty,
                  progress.stability,
                  progress.retrievability,
                  progress.correctCount,
                  progress.incorrectCount,
                  wordId
                ],
                (_, result) => resolve(result.rowsAffected),
                (_, error) => reject(error)
              );
            } else {
              // Insert new record
              tx.executeSql(
                `INSERT INTO user_progress
                 (wordId, lastReviewed, nextReview, difficulty, stability, retrievability, correctCount, incorrectCount)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  wordId,
                  progress.lastReviewed,
                  progress.nextReview,
                  progress.difficulty,
                  progress.stability,
                  progress.retrievability,
                  progress.correctCount || 0,
                  progress.incorrectCount || 0
                ],
                (_, result) => resolve(result.insertId),
                (_, error) => reject(error)
              );
            }
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getDueWords = async (limit: number, newWordsOnly: boolean = false) => {
  return new Promise<Word[]>((resolve, reject) => {
    db.transaction(
      (tx) => {
        let query = `
          SELECT w.*, up.difficulty, up.stability, up.retrievability, up.correctCount, up.incorrectCount
          FROM words w
          LEFT JOIN user_progress up ON w.id = up.wordId
        `;

        if (newWordsOnly) {
          query += ' WHERE up.wordId IS NULL';
        } else {
          query += ' WHERE up.nextReview <= ? OR up.nextReview IS NULL';
        }

        query += ' ORDER BY RANDOM() LIMIT ?';

        const params = newWordsOnly ? [limit] : [Date.now(), limit];

        tx.executeSql(
          query,
          params,
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getTotalWordsLearned = async () => {
  return new Promise<number>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM user_progress WHERE correctCount > 0',
          [],
          (_, { rows }) => resolve(rows._array[0].count),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getSettings = async () => {
  return new Promise<Settings>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM settings LIMIT 1',
          [],
          (_, { rows }) => {
            if (rows.length > 0) {
              const settings = rows._array[0];
              resolve({
                notificationsEnabled: settings.notificationsEnabled === 1,
                notificationTime: settings.notificationTime,
                dailyGoal: settings.dailyGoal,
                currentLanguage: settings.currentLanguage,
              });
            } else {
              resolve({
                notificationsEnabled: true,
                dailyGoal: 10,
                currentLanguage: 'spanish',
              });
            }
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateSettings = async (settings: Settings) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE settings SET notificationsEnabled = ?, notificationTime = ?, dailyGoal = ?, currentLanguage = ? WHERE id = 1',
          [
            settings.notificationsEnabled ? 1 : 0,
            settings.notificationTime,
            settings.dailyGoal,
            settings.currentLanguage,
          ],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      }
    );
  });
};
