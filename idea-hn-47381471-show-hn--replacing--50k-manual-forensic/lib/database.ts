import * as SQLite from 'expo-sqlite';
import { Transaction, Document } from './types';

const db = SQLite.openDatabase('traceguard.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            amount REAL NOT NULL,
            payee TEXT NOT NULL,
            type TEXT NOT NULL,
            documentId TEXT,
            documentHash TEXT,
            recurringFrequency TEXT,
            recurringEndDate TEXT,
            accountType TEXT,
            interestRate REAL
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            uri TEXT NOT NULL,
            hash TEXT NOT NULL,
            uploadDate TEXT NOT NULL,
            ocrText TEXT
          );`
        );
      },
      error => {
        console.error('Database initialization error:', error);
        reject(error);
      },
      () => {
        resolve(true);
      }
    );
  });
};

export const addTransaction = async (tx: Transaction) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      txn => {
        txn.executeSql(
          `INSERT INTO transactions (
            id, date, amount, payee, type, documentId, documentHash,
            recurringFrequency, recurringEndDate, accountType, interestRate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            tx.id,
            tx.date.toISOString(),
            tx.amount,
            tx.payee,
            tx.type,
            tx.documentId || null,
            tx.documentHash || null,
            tx.recurring?.frequency || null,
            tx.recurring?.endDate?.toISOString() || null,
            tx.accountType || null,
            tx.interestRate || null
          ],
          () => resolve(true),
          (_, error) => {
            console.error('Add transaction error:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const getTransactions = async (startDate?: Date, endDate?: Date): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      txn => {
        let query = 'SELECT * FROM transactions';
        const params: any[] = [];

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

        txn.executeSql(
          query,
          params,
          (_, { rows }) => {
            const transactions: Transaction[] = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              transactions.push({
                id: row.id,
                date: new Date(row.date),
                amount: row.amount,
                payee: row.payee,
                type: row.type,
                documentId: row.documentId,
                documentHash: row.documentHash,
                recurring: row.recurringFrequency ? {
                  frequency: row.recurringFrequency,
                  endDate: row.recurringEndDate ? new Date(row.recurringEndDate) : undefined
                } : undefined,
                accountType: row.accountType,
                interestRate: row.interestRate
              });
            }
            resolve(transactions);
          },
          (_, error) => {
            console.error('Get transactions error:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const addDocument = async (doc: Document) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      txn => {
        txn.executeSql(
          `INSERT INTO documents (id, uri, hash, uploadDate, ocrText) VALUES (?, ?, ?, ?, ?);`,
          [
            doc.id,
            doc.uri,
            doc.hash,
            doc.uploadDate.toISOString(),
            doc.ocrText
          ],
          () => resolve(true),
          (_, error) => {
            console.error('Add document error:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const getDocument = async (id: string): Promise<Document | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      txn => {
        txn.executeSql(
          'SELECT * FROM documents WHERE id = ?;',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const row = rows.item(0);
              resolve({
                id: row.id,
                uri: row.uri,
                hash: row.hash,
                uploadDate: new Date(row.uploadDate),
                ocrText: row.ocrText
              });
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Get document error:', error);
            reject(error);
          }
        );
      }
    );
  });
};
