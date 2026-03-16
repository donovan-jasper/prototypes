import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('querypal.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS databases (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        connectionString TEXT NOT NULL,
        lastSync DATETIME NOT NULL
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS cached_schemas (
        databaseId TEXT NOT NULL,
        schemaData TEXT NOT NULL,
        timestamp DATETIME NOT NULL,
        PRIMARY KEY (databaseId),
        FOREIGN KEY (databaseId) REFERENCES databases (id) ON DELETE CASCADE
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS query_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        databaseId TEXT NOT NULL,
        query TEXT NOT NULL,
        results TEXT,
        timestamp DATETIME NOT NULL,
        isFavorite INTEGER DEFAULT 0,
        FOREIGN KEY (databaseId) REFERENCES databases (id) ON DELETE CASCADE
      );`
    );
  });
};

export const getDatabases = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM databases ORDER BY name',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const addDatabase = (database: any) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO databases (id, name, type, connectionString, lastSync) VALUES (?, ?, ?, ?, ?)',
        [database.id, database.name, database.type, database.connectionString, database.lastSync],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const removeDatabase = (id: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM databases WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getCachedSchema = (databaseId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT schemaData FROM cached_schemas WHERE databaseId = ?',
        [databaseId],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(JSON.parse(rows._array[0].schemaData));
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const cacheSchema = (databaseId: string, schemaData: any) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO cached_schemas (databaseId, schemaData, timestamp) VALUES (?, ?, ?)',
        [databaseId, JSON.stringify(schemaData), new Date().toISOString()],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const clearCache = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM cached_schemas',
        [],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
