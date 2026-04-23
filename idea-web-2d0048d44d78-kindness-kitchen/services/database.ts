import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('giftgrub.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create gifts table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS gifts (
            id TEXT PRIMARY KEY,
            recipientName TEXT,
            restaurantId TEXT,
            restaurantName TEXT,
            restaurantImage TEXT,
            message TEXT,
            amount REAL,
            status TEXT,
            scheduledFor TEXT,
            recurring TEXT,
            createdAt TEXT
          );`
        );

        // Create favorites table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            type TEXT,
            name TEXT,
            details TEXT,
            createdAt TEXT
          );`
        );

        // Create users table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            subscriptionStatus TEXT,
            freeGiftsRemaining INTEGER,
            createdAt TEXT
          );`
        );
      },
      (error) => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve(true);
      }
    );
  });
};

export const saveGift = async (gift) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO gifts (
            id, recipientName, restaurantId, restaurantName, restaurantImage,
            message, amount, status, scheduledFor, recurring, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            gift.id,
            gift.recipientName,
            gift.restaurant.id,
            gift.restaurant.name,
            gift.restaurant.image,
            gift.message,
            gift.amount,
            gift.status,
            gift.scheduledFor.toISOString(),
            gift.recurring || null,
            new Date().toISOString(),
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getGiftHistory = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM gifts ORDER BY createdAt DESC',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getGiftById = async (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM gifts WHERE id = ?',
          [id],
          (_, { rows: { _array } }) => resolve(_array[0]),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const saveFavorite = async (favorite) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO favorites (id, type, name, details, createdAt) VALUES (?, ?, ?, ?, ?)',
          [
            favorite.id,
            favorite.type,
            favorite.name,
            JSON.stringify(favorite.details),
            new Date().toISOString(),
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getFavorites = async (type = null) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const query = type
          ? 'SELECT * FROM favorites WHERE type = ?'
          : 'SELECT * FROM favorites';

        tx.executeSql(
          query,
          type ? [type] : [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const saveUser = async (user) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO users (
            id, name, email, subscriptionStatus, freeGiftsRemaining, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            user.name,
            user.email,
            user.subscriptionStatus,
            user.freeGiftsRemaining,
            new Date().toISOString(),
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getUser = async (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?',
          [id],
          (_, { rows: { _array } }) => resolve(_array[0]),
          (_, error) => reject(error)
        );
      }
    );
  });
};
