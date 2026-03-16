import * as SQLite from 'expo-sqlite';
import { Transaction, Document } from './types';
import CryptoJS from 'crypto-js';

const db = SQLite.openDatabase('traceguard.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            uri TEXT NOT NULL,
            hash TEXT NOT NULL,
            uploadDate TEXT NOT NULL,
            ocrText TEXT NOT NULL
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            amount REAL NOT NULL,
            payee TEXT NOT NULL,
            type TEXT NOT NULL,
            documentId TEXT NOT NULL,
            documentHash TEXT NOT NULL,
            FOREIGN KEY (documentId) REFERENCES documents (id)
          );`
        );
      },
      (error) => reject(error),
      () => resolve()
    );
  });
};

export const addDocument = async (doc: Document) => {
  const id = CryptoJS.lib.WordArray.random(16).toString();
  const encryptedUri = CryptoJS.AES.encrypt(doc.uri, 'secret key').toString();

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO documents (id, uri, hash, uploadDate, ocrText) VALUES (?, ?, ?, ?, ?)',
          [id, encryptedUri, doc.hash, doc.uploadDate.toISOString(), doc.ocrText],
          (_, result) => resolve(id),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getDocuments = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM documents',
          [],
          (_, { rows }) => {
            const documents = rows._array.map(doc => ({
              ...doc,
              uri: CryptoJS.AES.decrypt(doc.uri, 'secret key').toString(CryptoJS.enc.Utf8),
              uploadDate: new Date(doc.uploadDate)
            }));
            resolve(documents);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const addTransaction = async (tx: Transaction) => {
  const id = CryptoJS.lib.WordArray.random(16).toString();

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO transactions (id, date, amount, payee, type, documentId, documentHash) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            tx.date.toISOString(),
            tx.amount,
            tx.payee,
            tx.type,
            tx.documentId,
            tx.documentHash
          ],
          (_, result) => resolve(id),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getTransactions = async (startDate?: Date, endDate?: Date) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        let query = 'SELECT * FROM transactions';
        const params = [];

        if (startDate || endDate) {
          query += ' WHERE';
          if (startDate) {
            query += ' date >= ?';
            params.push(startDate.toISOString());
          }
          if (endDate) {
            if (startDate) query += ' AND';
            query += ' date <= ?';
            params.push(endDate.toISOString());
          }
        }

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const transactions = rows._array.map(tx => ({
              ...tx,
              date: new Date(tx.date)
            }));
            resolve(transactions);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteDocument = async (id: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM documents WHERE id = ?',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};
