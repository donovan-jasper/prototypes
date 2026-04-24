import * as SQLite from 'expo-sqlite';
import { calculateNextReview, ReviewHistory } from './spacedRepetition';

const db = SQLite.openDatabase('mindmeld.db');

export const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS cards (id INTEGER PRIMARY KEY AUTOINCREMENT, deckId INTEGER, front TEXT, back TEXT, createdAt TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS decks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, createdAt TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, cardId INTEGER, reviewDate TEXT, recallStrength REAL, nextReviewDate TEXT, interval INTEGER, repetition INTEGER, efactor REAL);'
    );
  });
};

export const addDeck = (name: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO decks (name, createdAt) VALUES (?, ?);',
        [name, new Date().toISOString()],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const addCard = (deckId: number, front: string, back: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO cards (deckId, front, back, createdAt) VALUES (?, ?, ?, ?);',
        [deckId, front, back, new Date().toISOString()],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getDecks = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM decks;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getCardsForDeck = (deckId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM cards WHERE deckId = ?;',
        [deckId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const addReview = (cardId: number, recallStrength: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First get the last review history for this card
      tx.executeSql(
        'SELECT interval, repetition, efactor FROM reviews WHERE cardId = ? ORDER BY reviewDate DESC LIMIT 1;',
        [cardId],
        (_, { rows }) => {
          const lastReview = rows._array.length > 0 ? rows._array[0] : null;
          const reviewDate = new Date().toISOString();

          // Calculate next review using SM-2 algorithm
          const { nextReviewDate, updatedHistory } = calculateNextReview(
            new Date(),
            recallStrength,
            lastReview
          );

          // Insert the new review with all SM-2 parameters
          tx.executeSql(
            'INSERT INTO reviews (cardId, reviewDate, recallStrength, nextReviewDate, interval, repetition, efactor) VALUES (?, ?, ?, ?, ?, ?, ?);',
            [
              cardId,
              reviewDate,
              recallStrength,
              nextReviewDate.toISOString(),
              updatedHistory.interval,
              updatedHistory.repetition,
              updatedHistory.efactor
            ],
            (_, result) => resolve(result.insertId),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getReviewsForCard = (cardId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM reviews WHERE cardId = ? ORDER BY reviewDate DESC;',
        [cardId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getDueCards = () => {
  const today = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT c.*, r.nextReviewDate
         FROM cards c
         LEFT JOIN (
           SELECT cardId, MAX(reviewDate) as maxReviewDate
           FROM reviews
           GROUP BY cardId
         ) latest ON c.id = latest.cardId
         LEFT JOIN reviews r ON c.id = r.cardId AND latest.maxReviewDate = r.reviewDate
         WHERE r.nextReviewDate <= ? OR r.nextReviewDate IS NULL
         ORDER BY r.nextReviewDate ASC;`,
        [today],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
