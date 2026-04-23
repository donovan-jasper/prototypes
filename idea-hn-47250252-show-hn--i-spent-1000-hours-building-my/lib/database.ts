import * as SQLite from 'expo-sqlite';
import { Transaction, Holding, Asset, Liability } from './types';

const db = SQLite.openDatabase('finflow.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create transactions table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            note TEXT,
            receiptUri TEXT
          );`,
          [],
          () => {},
          (_, error) => reject(error)
        );

        // Create holdings table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS holdings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            shares REAL NOT NULL,
            costBasis REAL NOT NULL,
            purchaseDate TEXT NOT NULL,
            currentPrice REAL
          );`,
          [],
          () => {},
          (_, error) => reject(error)
        );

        // Create assets table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            value REAL NOT NULL,
            type TEXT NOT NULL
          );`,
          [],
          () => {},
          (_, error) => reject(error)
        );

        // Create liabilities table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS liabilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            value REAL NOT NULL,
            type TEXT NOT NULL
          );`,
          [],
          () => resolve(true),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error),
      () => resolve(true)
    );
  });
};

// Transaction functions
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO transactions (amount, category, date, type, note, receiptUri) VALUES (?, ?, ?, ?, ?, ?)',
          [transaction.amount, transaction.category, transaction.date, transaction.type, transaction.note || null, transaction.receiptUri || null],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getTransactions = async (): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM transactions ORDER BY date DESC',
          [],
          (_, { rows }) => {
            const transactions: Transaction[] = [];
            for (let i = 0; i < rows.length; i++) {
              transactions.push(rows.item(i));
            }
            resolve(transactions);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

// Holding functions
export const addHolding = async (holding: Omit<Holding, 'id'>) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // First check if holding already exists
        tx.executeSql(
          'SELECT * FROM holdings WHERE symbol = ?',
          [holding.symbol],
          (_, { rows }) => {
            if (rows.length > 0) {
              reject(new Error('Holding with this symbol already exists'));
              return;
            }

            // If not exists, insert new holding
            tx.executeSql(
              'INSERT INTO holdings (symbol, shares, costBasis, purchaseDate, currentPrice) VALUES (?, ?, ?, ?, ?)',
              [holding.symbol, holding.shares, holding.costBasis, holding.purchaseDate, holding.currentPrice || null],
              (_, result) => resolve(result.insertId),
              (_, error) => reject(error)
            );
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getHoldings = async (): Promise<Holding[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM holdings',
          [],
          (_, { rows }) => {
            const holdings: Holding[] = [];
            for (let i = 0; i < rows.length; i++) {
              holdings.push(rows.item(i));
            }
            resolve(holdings);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const updateHolding = async (holding: Holding): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE holdings SET symbol = ?, shares = ?, costBasis = ?, purchaseDate = ?, currentPrice = ? WHERE id = ?',
          [holding.symbol, holding.shares, holding.costBasis, holding.purchaseDate, holding.currentPrice || null, holding.id],
          () => resolve(),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

// Asset and liability functions
export const addAsset = async (asset: Omit<Asset, 'id'>) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO assets (name, value, type) VALUES (?, ?, ?)',
          [asset.name, asset.value, asset.type],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getAssets = async (): Promise<Asset[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM assets',
          [],
          (_, { rows }) => {
            const assets: Asset[] = [];
            for (let i = 0; i < rows.length; i++) {
              assets.push(rows.item(i));
            }
            resolve(assets);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const addLiability = async (liability: Omit<Liability, 'id'>) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO liabilities (name, value, type) VALUES (?, ?, ?)',
          [liability.name, liability.value, liability.type],
          (_, result) => resolve(result.insertId),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};

export const getLiabilities = async (): Promise<Liability[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM liabilities',
          [],
          (_, { rows }) => {
            const liabilities: Liability[] = [];
            for (let i = 0; i < rows.length; i++) {
              liabilities.push(rows.item(i));
            }
            resolve(liabilities);
          },
          (_, error) => reject(error)
        );
      },
      (error) => reject(error)
    );
  });
};
