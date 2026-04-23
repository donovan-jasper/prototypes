import * as SQLite from 'expo-sqlite';
import { Transaction, Holding, Asset, Liability } from './types';

const db = SQLite.openDatabase('finflow.db');

export const initDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
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
            receiptPhoto TEXT
          );`,
          [],
          () => {
            // Create index for date
            tx.executeSql(
              `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`,
              []
            );
          }
        );

        // Create holdings table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS holdings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            shares REAL NOT NULL,
            costBasis REAL NOT NULL,
            assetType TEXT NOT NULL
          );`,
          [],
          () => {
            // Create index for symbol
            tx.executeSql(
              `CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol);`,
              []
            );
          }
        );

        // Create assets table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            value REAL NOT NULL,
            type TEXT NOT NULL
          );`
        );

        // Create liabilities table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS liabilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            value REAL NOT NULL,
            type TEXT NOT NULL
          );`
        );
      },
      (error) => {
        console.error('Error initializing database:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

// Transaction operations
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO transactions (amount, category, date, type, note, receiptPhoto)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            transaction.amount,
            transaction.category,
            transaction.date,
            transaction.type,
            transaction.note || null,
            transaction.receiptPhoto || null
          ],
          (_, result) => {
            resolve({
              ...transaction,
              id: result.insertId
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

export const getTransactions = async (): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM transactions ORDER BY date DESC;`,
          [],
          (_, result) => {
            const transactions: Transaction[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              transactions.push(result.rows.item(i));
            }
            resolve(transactions);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

// Holding operations
export const addHolding = async (holding: Omit<Holding, 'id'>): Promise<Holding> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO holdings (symbol, shares, costBasis, assetType)
           VALUES (?, ?, ?, ?);`,
          [
            holding.symbol,
            holding.shares,
            holding.costBasis,
            holding.assetType
          ],
          (_, result) => {
            resolve({
              ...holding,
              id: result.insertId
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

export const getHoldings = async (): Promise<Holding[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM holdings;`,
          [],
          (_, result) => {
            const holdings: Holding[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              holdings.push(result.rows.item(i));
            }
            resolve(holdings);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

export const updateHolding = async (id: number, updates: Partial<Holding>): Promise<Holding> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // First get the current holding
        tx.executeSql(
          `SELECT * FROM holdings WHERE id = ?;`,
          [id],
          (_, result) => {
            if (result.rows.length === 0) {
              reject(new Error('Holding not found'));
              return;
            }

            const currentHolding = result.rows.item(0);
            const updatedHolding = { ...currentHolding, ...updates };

            // Update the holding
            tx.executeSql(
              `UPDATE holdings
               SET symbol = ?, shares = ?, costBasis = ?, assetType = ?
               WHERE id = ?;`,
              [
                updatedHolding.symbol,
                updatedHolding.shares,
                updatedHolding.costBasis,
                updatedHolding.assetType,
                id
              ],
              () => {
                resolve(updatedHolding);
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

export const deleteHolding = async (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM holdings WHERE id = ?;`,
          [id],
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

// Asset operations
export const addAsset = async (asset: Omit<Asset, 'id'>): Promise<Asset> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO assets (name, value, type)
           VALUES (?, ?, ?);`,
          [
            asset.name,
            asset.value,
            asset.type
          ],
          (_, result) => {
            resolve({
              ...asset,
              id: result.insertId
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

export const getAssets = async (): Promise<Asset[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM assets;`,
          [],
          (_, result) => {
            const assets: Asset[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              assets.push(result.rows.item(i));
            }
            resolve(assets);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

// Liability operations
export const addLiability = async (liability: Omit<Liability, 'id'>): Promise<Liability> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO liabilities (name, value, type)
           VALUES (?, ?, ?);`,
          [
            liability.name,
            liability.value,
            liability.type
          ],
          (_, result) => {
            resolve({
              ...liability,
              id: result.insertId
            });
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};

export const getLiabilities = async (): Promise<Liability[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM liabilities;`,
          [],
          (_, result) => {
            const liabilities: Liability[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              liabilities.push(result.rows.item(i));
            }
            resolve(liabilities);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      }
    );
  });
};
