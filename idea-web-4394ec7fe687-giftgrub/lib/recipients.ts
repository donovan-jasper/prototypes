import * as SQLite from 'expo-sqlite';
import { Recipient } from '../types';

const db = SQLite.openDatabase('giftswift.db');

export const initRecipientsTable = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS recipients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            preferences TEXT,
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

export const addRecipient = async (recipient: Omit<Recipient, 'id'>): Promise<Recipient> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO recipients (name, email, phone, preferences)
           VALUES (?, ?, ?, ?);`,
          [
            recipient.name,
            recipient.email || null,
            recipient.phone || null,
            JSON.stringify(recipient.preferences || {}),
          ],
          (_, result) => {
            const id = result.insertId;
            resolve({ ...recipient, id });
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getRecipients = async (): Promise<Recipient[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM recipients ORDER BY name ASC;`,
          [],
          (_, { rows }) => {
            const recipients: Recipient[] = [];
            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              recipients.push({
                id: item.id,
                name: item.name,
                email: item.email,
                phone: item.phone,
                preferences: item.preferences ? JSON.parse(item.preferences) : null,
              });
            }
            resolve(recipients);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getRecipientById = async (id: number): Promise<Recipient | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM recipients WHERE id = ?;`,
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const item = rows.item(0);
              resolve({
                id: item.id,
                name: item.name,
                email: item.email,
                phone: item.phone,
                preferences: item.preferences ? JSON.parse(item.preferences) : null,
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

export const updateRecipient = async (id: number, data: Partial<Recipient>): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
          fields.push('name = ?');
          values.push(data.name);
        }
        if (data.email !== undefined) {
          fields.push('email = ?');
          values.push(data.email || null);
        }
        if (data.phone !== undefined) {
          fields.push('phone = ?');
          values.push(data.phone || null);
        }
        if (data.preferences !== undefined) {
          fields.push('preferences = ?');
          values.push(JSON.stringify(data.preferences || {}));
        }

        if (fields.length === 0) {
          resolve();
          return;
        }

        values.push(id);

        tx.executeSql(
          `UPDATE recipients SET ${fields.join(', ')} WHERE id = ?;`,
          values,
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const deleteRecipient = async (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM recipients WHERE id = ?;`,
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};
