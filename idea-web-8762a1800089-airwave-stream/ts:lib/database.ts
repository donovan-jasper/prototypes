import * as SQLite from 'expo-sqlite';

export interface FavoriteChannel {
  id: string;
  name: string;
  number: string;
  currentShow?: string;
}

export const openDatabase = () => {
  return SQLite.openDatabase('tunelocal.db');
};

export const createTables = (db: SQLite.SQLiteDatabase) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            name TEXT,
            number TEXT,
            currentShow TEXT
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS viewing_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channelId TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          );`
        );
      },
      error => {
        console.error('Error creating tables:', error);
        reject(error);
      },
      () => resolve()
    );
  });
};

export const addFavorite = (db: SQLite.SQLiteDatabase, channel: FavoriteChannel) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO favorites (id, name, number, currentShow) VALUES (?, ?, ?, ?);`,
          [channel.id, channel.name, channel.number, channel.currentShow]
        );
      },
      error => {
        console.error('Error adding favorite:', error);
        reject(error);
      },
      () => resolve()
    );
  });
};

export const removeFavorite = (db: SQLite.SQLiteDatabase, channelId: string) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(`DELETE FROM favorites WHERE id = ?;`, [channelId]);
      },
      error => {
        console.error('Error removing favorite:', error);
        reject(error);
      },
      () => resolve()
    );
  });
};

export const getFavorites = (db: SQLite.SQLiteDatabase) => {
  return new Promise<FavoriteChannel[]>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM favorites;`,
          [],
          (_, { rows }) => {
            const favorites: FavoriteChannel[] = [];
            for (let i = 0; i < rows.length; i++) {
              favorites.push(rows.item(i));
            }
            resolve(favorites);
          },
          error => {
            console.error('Error getting favorites:', error);
            reject(error);
          }
        );
      }
    );
  });
};
