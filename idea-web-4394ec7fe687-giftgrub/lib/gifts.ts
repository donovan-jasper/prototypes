import * as SQLite from 'expo-sqlite';
import { Gift, SentGift } from '../types';

const db = SQLite.openDatabase('giftswift.db');

export const initGiftsTable = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS gifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image_url TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );`,
          [],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const initSentGiftsTable = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sent_gifts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gift_id INTEGER NOT NULL,
            recipient_id INTEGER NOT NULL,
            message TEXT,
            status TEXT DEFAULT 'sent',
            sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
            redeemed_at TEXT,
            FOREIGN KEY (gift_id) REFERENCES gifts(id),
            FOREIGN KEY (recipient_id) REFERENCES recipients(id)
          );`,
          [],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const createGift = async (gift: Omit<Gift, 'id'>): Promise<Gift> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO gifts (title, category, price, description, image_url)
           VALUES (?, ?, ?, ?, ?);`,
          [
            gift.title,
            gift.category,
            gift.price,
            gift.description || null,
            gift.image_url || null,
          ],
          (_, result) => {
            const id = result.insertId;
            resolve({ ...gift, id });
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getGiftById = async (id: number): Promise<Gift | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM gifts WHERE id = ?;`,
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const item = rows.item(0);
              resolve({
                id: item.id,
                title: item.title,
                category: item.category,
                price: item.price,
                description: item.description,
                image_url: item.image_url,
              });
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getGiftsByCategory = async (category: string): Promise<Gift[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM gifts WHERE category = ? ORDER BY title ASC;`,
          [category],
          (_, { rows }) => {
            const gifts: Gift[] = [];
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              gifts.push({
                id: item.id,
                title: item.title,
                category: item.category,
                price: item.price,
                description: item.description,
                image_url: item.image_url,
              });
            }
            resolve(gifts);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const searchGifts = async (query: string): Promise<Gift[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM gifts
           WHERE title LIKE ? OR description LIKE ?
           ORDER BY title ASC;`,
          [`%${query}%`, `%${query}%`],
          (_, { rows }) => {
            const gifts: Gift[] = [];
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              gifts.push({
                id: item.id,
                title: item.title,
                category: item.category,
                price: item.price,
                description: item.description,
                image_url: item.image_url,
              });
            }
            resolve(gifts);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getSentGiftsByRecipient = async (recipientId: number): Promise<SentGift[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM sent_gifts
           WHERE recipient_id = ?
           ORDER BY sent_at DESC;`,
          [recipientId],
          (_, { rows }) => {
            const gifts: SentGift[] = [];
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              gifts.push({
                id: item.id,
                gift_id: item.gift_id,
                recipient_id: item.recipient_id,
                message: item.message,
                status: item.status,
                sent_at: item.sent_at,
                redeemed_at: item.redeemed_at,
              });
            }
            resolve(gifts);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const recordSentGift = async (gift: Omit<SentGift, 'id'>): Promise<SentGift> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO sent_gifts (gift_id, recipient_id, message, status, sent_at, redeemed_at)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            gift.gift_id,
            gift.recipient_id,
            gift.message || null,
            gift.status || 'sent',
            gift.sent_at || new Date().toISOString(),
            gift.redeemed_at || null,
          ],
          (_, result) => {
            const id = result.insertId;
            resolve({ ...gift, id });
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};
