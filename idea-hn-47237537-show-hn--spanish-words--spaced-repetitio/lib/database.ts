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
            difficulty REAL,
            stability REAL,
            retrievability REAL,
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
      }
    );
  });
};

export const getDueWords = async (limit: number = 10) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT w.*, up.lastReviewed, up.nextReview, up.difficulty, up.stability, up.retrievability, up.correctCount, up.incorrectCount
           FROM words w
           LEFT JOIN user_progress up ON w.id = up.wordId
           WHERE up.wordId IS NULL OR up.nextReview IS NULL OR up.nextReview <= ?
           ORDER BY 
             CASE WHEN up.wordId IS NULL THEN 0 ELSE 1 END,
             CASE WHEN up.nextReview IS NULL THEN 0 ELSE 1 END,
             w.frequency ASC
           LIMIT ?`,
          [Date.now(), limit],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getTotalWordsLearned = async () => {
  return new Promise((resolve, reject) => {
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

export const getWordsByDifficulty = async (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
  let condition = '';
  switch (difficulty) {
    case 'beginner':
      condition = 'correctCount < 3';
      break;
    case 'intermediate':
      condition = 'correctCount >= 3 AND correctCount < 7';
      break;
    case 'advanced':
      condition = 'correctCount >= 7';
      break;
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT w.*, up.*
           FROM words w
           JOIN user_progress up ON w.id = up.wordId
           WHERE ${condition}`,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getSettings = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM settings LIMIT 1',
          [],
          (_, { rows }) => resolve(rows._array[0] || {}),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateSettings = async (settings: any) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO settings (id, notificationsEnabled, notificationTime, dailyGoal, currentLanguage)
           VALUES ((SELECT id FROM settings LIMIT 1), ?, ?, ?, ?)`,
          [
            settings.notificationsEnabled,
            settings.notificationTime,
            settings.dailyGoal,
            settings.currentLanguage
          ],
          (_, result) => resolve(result.rowsAffected),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const isDatabaseEmpty = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM words',
          [],
          (_, { rows }) => resolve(rows._array[0].count === 0),
          (_, error) => reject(error)
        );
      }
    );
  });
};
