import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('finflow.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            note TEXT,
            type TEXT NOT NULL,
            date TEXT NOT NULL
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS holdings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            shares REAL NOT NULL,
            costBasis REAL NOT NULL,
            currentPrice REAL NOT NULL,
            assetType TEXT NOT NULL
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value REAL NOT NULL,
            type TEXT NOT NULL
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS liabilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value REAL NOT NULL,
            type TEXT NOT NULL
          );`
        );
      },
      (error) => reject(error),
      () => resolve()
    );
  });
};

export const addTransaction = (transaction) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO transactions (amount, category, note, type, date) VALUES (?, ?, ?, ?, ?)',
          [transaction.amount, transaction.category, transaction.note, transaction.type, transaction.date],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getTransactions = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM transactions ORDER BY date DESC',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateTransaction = (transaction) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE transactions SET amount = ?, category = ?, note = ?, type = ?, date = ? WHERE id = ?',
          [transaction.amount, transaction.category, transaction.note, transaction.type, transaction.date, transaction.id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteTransaction = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM transactions WHERE id = ?',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const addHolding = (holding) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO holdings (symbol, shares, costBasis, currentPrice, assetType) VALUES (?, ?, ?, ?, ?)',
          [holding.symbol, holding.shares, holding.costBasis, holding.currentPrice, holding.assetType],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getHoldings = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM holdings',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateHolding = (holding) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE holdings SET symbol = ?, shares = ?, costBasis = ?, currentPrice = ?, assetType = ? WHERE id = ?',
          [holding.symbol, holding.shares, holding.costBasis, holding.currentPrice, holding.assetType, holding.id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteHolding = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM holdings WHERE id = ?',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const addAsset = (asset) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO assets (value, type) VALUES (?, ?)',
          [asset.value, asset.type],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getAssets = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM assets',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateAsset = (asset) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE assets SET value = ?, type = ? WHERE id = ?',
          [asset.value, asset.type, asset.id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteAsset = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM assets WHERE id = ?',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const addLiability = (liability) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO liabilities (value, type) VALUES (?, ?)',
          [liability.value, liability.type],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getLiabilities = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM liabilities',
          [],
          (_, { rows: { _array } }) => resolve(_array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateLiability = (liability) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'UPDATE liabilities SET value = ?, type = ? WHERE id = ?',
          [liability.value, liability.type, liability.id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteLiability = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM liabilities WHERE id = ?',
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};
