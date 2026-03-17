import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('lootvault.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        platform TEXT NOT NULL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        game_id INTEGER NOT NULL,
        rarity TEXT,
        value REAL,
        FOREIGN KEY (game_id) REFERENCES games (id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS alert_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        item_id INTEGER NOT NULL,
        target_price REAL NOT NULL,
        FOREIGN KEY (game_id) REFERENCES games (id),
        FOREIGN KEY (item_id) REFERENCES items (id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS price_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        price REAL NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES items (id)
      );`
    );
  });
  
  seedDatabase();
};

export const seedDatabase = () => {
  db.transaction(tx => {
    tx.executeSql('SELECT COUNT(*) as count FROM games', [], (_, { rows }) => {
      if (rows._array[0].count === 0) {
        tx.executeSql('INSERT INTO games (name, platform) VALUES (?, ?)', ['Fortnite', 'PC/Console']);
        tx.executeSql('INSERT INTO games (name, platform) VALUES (?, ?)', ['Genshin Impact', 'Mobile/PC']);
        tx.executeSql('INSERT INTO games (name, platform) VALUES (?, ?)', ['Destiny 2', 'PC/Console']);
      }
    });
  });
};

export const insertItem = (item) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO items (name, game_id, rarity, value) VALUES (?, ?, ?, ?)',
        [item.name, item.game_id, item.rarity, item.value],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getItemsByGame = (gameId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM items WHERE game_id = ?',
        [gameId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllItems = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM items',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getGameByName = (name) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM games WHERE name = ?',
        [name],
        (_, { rows }) => resolve(rows._array[0]),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateItemValue = (itemId, value) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE items SET value = ? WHERE id = ?',
        [value, itemId],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};
