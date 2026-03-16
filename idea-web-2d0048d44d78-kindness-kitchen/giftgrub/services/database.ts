import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('giftgrub.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS gifts (id TEXT PRIMARY KEY, recipientName TEXT, restaurant TEXT, message TEXT, status TEXT, amount REAL, createdAt TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY, type TEXT, name TEXT, details TEXT);'
    );
  });
};

export const saveGift = (gift) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO gifts (id, recipientName, restaurant, message, status, amount, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?);',
        [gift.id, gift.recipientName, gift.restaurant, gift.message, gift.status, gift.amount || 0, new Date().toISOString()],
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
        'SELECT * FROM gifts ORDER BY createdAt DESC;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveFavorite = (favorite) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO favorites (id, type, name, details) VALUES (?, ?, ?, ?);',
        [favorite.id, favorite.type, favorite.name, JSON.stringify(favorite.details)],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getFavorites = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM favorites;',
        [],
        (_, { rows: { _array } }) => resolve(_array.map(fav => ({ ...fav, details: JSON.parse(fav.details) }))),
        (_, error) => reject(error)
      );
    });
  });
};
