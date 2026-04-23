import * as SQLite from 'expo-sqlite';
import { Database } from '../../types/database';

const db = SQLite.openDatabase('querypal.db');

export const initCache = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS cached_schemas (id TEXT PRIMARY KEY, schema TEXT, lastUpdated INTEGER);'
    );
  });
};

export const cacheSchema = (id: string, schema: any) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO cached_schemas (id, schema, lastUpdated) VALUES (?, ?, ?);',
        [id, JSON.stringify(schema), Date.now()],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSchema = (id: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT schema FROM cached_schemas WHERE id = ?;',
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(JSON.parse(rows.item(0).schema));
          } else {
            reject(new Error('Schema not found in cache'));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const clearCache = () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM cached_schemas;',
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
