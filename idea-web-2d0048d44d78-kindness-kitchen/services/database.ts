import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('giftgrub.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS gifts (
        id TEXT PRIMARY KEY,
        recipientName TEXT,
        restaurantName TEXT,
        restaurantCuisine TEXT,
        message TEXT,
        amount REAL,
        status TEXT,
        scheduledFor TEXT,
        createdAt TEXT
      );`
    );
  });
};

export const saveGift = (gift) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO gifts (
          id, recipientName, restaurantName, restaurantCuisine, message, amount, status, scheduledFor, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          gift.id,
          gift.recipientName,
          gift.restaurant.name,
          gift.restaurant.cuisine,
          gift.message,
          gift.amount,
          gift.status,
          gift.scheduledFor.toISOString(),
          gift.createdAt || new Date().toISOString(),
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getGiftHistory = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM gifts ORDER BY createdAt DESC',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};
