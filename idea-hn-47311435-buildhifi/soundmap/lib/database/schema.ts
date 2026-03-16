import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('soundmap.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        brand TEXT,
        impedance REAL,
        power REAL,
        connections TEXT,
        price REAL,
        imageUrl TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS systems (
        id TEXT PRIMARY KEY,
        name TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS systemComponents (
        systemId TEXT,
        productId TEXT,
        quantity INTEGER,
        position INTEGER,
        PRIMARY KEY (systemId, productId),
        FOREIGN KEY (systemId) REFERENCES systems(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS userSettings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        isPremium INTEGER,
        scanCount INTEGER,
        systemCount INTEGER
      );`
    );
  });
};
