import * as SQLite from 'expo-sqlite';
import { HealthPassportRecord } from '../types';

const db = SQLite.openDatabase('carequest.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS health_passport (
        id TEXT PRIMARY KEY,
        memberId TEXT,
        type TEXT,
        name TEXT,
        details TEXT,
        date TEXT,
        expirationDate TEXT,
        notes TEXT
      );`
    );
  });
};

export const addHealthPassportRecord = (record: Omit<HealthPassportRecord, 'id'>): Promise<HealthPassportRecord> => {
  return new Promise((resolve, reject) => {
    const id = Date.now().toString();
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO health_passport (id, memberId, type, name, details, date, expirationDate, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, record.memberId, record.type, record.name, record.details, record.date, record.expirationDate, record.notes],
        (_, result) => {
          resolve({ ...record, id });
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getHealthPassportRecords = (memberId: string): Promise<HealthPassportRecord[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM health_passport WHERE memberId = ?',
        [memberId],
        (_, result) => {
          const records: HealthPassportRecord[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            records.push(result.rows.item(i));
          }
          resolve(records);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const updateHealthPassportRecord = (record: HealthPassportRecord): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE health_passport SET memberId = ?, type = ?, name = ?, details = ?, date = ?, expirationDate = ?, notes = ? WHERE id = ?',
        [record.memberId, record.type, record.name, record.details, record.date, record.expirationDate, record.notes, record.id],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteHealthPassportRecord = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM health_passport WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
