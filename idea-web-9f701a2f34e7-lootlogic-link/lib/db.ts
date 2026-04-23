import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('lootvault.db');

export const initializeDB = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create tables if they don't exist
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS games (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            platform TEXT NOT NULL,
            connected_at TEXT NOT NULL
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            game_id TEXT NOT NULL,
            name TEXT NOT NULL,
            rarity TEXT NOT NULL,
            value REAL NOT NULL,
            acquired_at TEXT NOT NULL,
            FOREIGN KEY (game_id) REFERENCES games (id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS alert_rules (
            id TEXT PRIMARY KEY,
            game_id TEXT NOT NULL,
            item_name TEXT NOT NULL,
            target_price REAL NOT NULL,
            notification_type TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (game_id) REFERENCES games (id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT NOT NULL,
            price REAL NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (item_id) REFERENCES items (id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS watchlist (
            id TEXT PRIMARY KEY,
            game_id TEXT NOT NULL,
            item_id TEXT NOT NULL,
            target_price REAL NOT NULL,
            added_at TEXT NOT NULL,
            FOREIGN KEY (game_id) REFERENCES games (id),
            FOREIGN KEY (item_id) REFERENCES items (id)
          );`
        );
      },
      (error) => {
        console.error('Error initializing database:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve(true);
      }
    );
  });
};

export const getItemsFromDB = async (): Promise<Item[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT items.*, games.name as game FROM items
           JOIN games ON items.game_id = games.id`,
          [],
          (_, { rows }) => {
            const items: Item[] = [];
            for (let i = 0; i < rows.length; i++) {
              items.push({
                id: rows.item(i).id,
                name: rows.item(i).name,
                game: rows.item(i).game,
                rarity: rows.item(i).rarity,
                value: rows.item(i).value
              });
            }
            resolve(items);
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

export const getItemById = async (itemId: string): Promise<Item | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT items.*, games.name as game FROM items
           JOIN games ON items.game_id = games.id
           WHERE items.id = ?`,
          [itemId],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve({
                id: rows.item(0).id,
                name: rows.item(0).name,
                game: rows.item(0).game,
                rarity: rows.item(0).rarity,
                value: rows.item(0).value
              });
            } else {
              resolve(null);
            }
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

export const updateItemValue = async (itemId: string, newValue: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE items SET value = ? WHERE id = ?`,
          [newValue, itemId],
          (_, result) => {
            resolve(result);
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

export const getPriceHistory = async (itemId: string): Promise<PriceHistory[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM price_history WHERE item_id = ? ORDER BY date DESC LIMIT 30`,
          [itemId],
          (_, { rows }) => {
            const history: PriceHistory[] = [];
            for (let i = 0; i < rows.length; i++) {
              history.push({
                id: rows.item(i).id,
                itemId: rows.item(i).item_id,
                price: rows.item(i).price,
                date: rows.item(i).date
              });
            }
            resolve(history);
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

export const insertPriceHistory = async (itemId: string, price: number, date: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO price_history (item_id, price, date) VALUES (?, ?, ?)`,
          [itemId, price, date],
          (_, result) => {
            resolve(result);
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

export const addToWatchlist = async (gameId: string, itemId: string, targetPrice: number) => {
  return new Promise((resolve, reject) => {
    const id = `${gameId}-${itemId}`;
    const addedAt = new Date().toISOString();

    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO watchlist (id, game_id, item_id, target_price, added_at)
           VALUES (?, ?, ?, ?, ?)`,
          [id, gameId, itemId, targetPrice, addedAt],
          (_, result) => {
            resolve(result);
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

export const getWatchlist = async (): Promise<WatchlistItem[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT watchlist.*, items.name as item_name, games.name as game_name
           FROM watchlist
           JOIN items ON watchlist.item_id = items.id
           JOIN games ON watchlist.game_id = games.id`,
          [],
          (_, { rows }) => {
            const watchlist: WatchlistItem[] = [];
            for (let i = 0; i < rows.length; i++) {
              watchlist.push({
                id: rows.item(i).id,
                gameId: rows.item(i).game_id,
                gameName: rows.item(i).game_name,
                itemId: rows.item(i).item_id,
                itemName: rows.item(i).item_name,
                targetPrice: rows.item(i).target_price,
                addedAt: rows.item(i).added_at
              });
            }
            resolve(watchlist);
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

export const removeFromWatchlist = async (id: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `DELETE FROM watchlist WHERE id = ?`,
          [id],
          (_, result) => {
            resolve(result);
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

interface Item {
  id: string;
  name: string;
  game: string;
  rarity: string;
  value: number;
}

interface PriceHistory {
  id: number;
  itemId: string;
  price: number;
  date: string;
}

interface WatchlistItem {
  id: string;
  gameId: string;
  gameName: string;
  itemId: string;
  itemName: string;
  targetPrice: number;
  addedAt: string;
}
