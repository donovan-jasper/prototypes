import * as SQLite from 'expo-sqlite';

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
      'CREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, cardId INTEGER, reviewDate TEXT, recallStrength REAL, nextReviewDate TEXT);'
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
  const reviewDate = new Date().toISOString();
  const nextReviewDate = calculateNextReview(new Date(), recallStrength).toISOString();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO reviews (cardId, reviewDate, recallStrength, nextReviewDate) VALUES (?, ?, ?, ?);',
        [cardId, reviewDate, recallStrength, nextReviewDate],
        (_, result) => resolve(result.insertId),
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
         LEFT JOIN reviews r ON c.id = r.cardId
         WHERE r.nextReviewDate <= ? OR r.nextReviewDate IS NULL
         ORDER BY r.nextReviewDate ASC;`,
        [today],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
