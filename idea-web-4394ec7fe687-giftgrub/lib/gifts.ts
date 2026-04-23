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
            imageUrl TEXT,
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
            status TEXT NOT NULL,
            sent_at TEXT NOT NULL,
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
                giftId: item.gift_id,
                recipientId: item.recipient_id,
                message: item.message,
                status: item.status,
                sentAt: item.sent_at,
                redeemedAt: item.redeemed_at,
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
