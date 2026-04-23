import * as SQLite from 'expo-sqlite';
import { SavedItem, Collection } from '@/types';

const db = SQLite.openDatabase('savestack.db');

export async function initDB() {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create items table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            fileUri TEXT,
            thumbnailUri TEXT,
            source TEXT,
            createdAt INTEGER NOT NULL,
            collectionId INTEGER,
            duration INTEGER,
            fileSize INTEGER,
            FOREIGN KEY (collectionId) REFERENCES collections(id)
          );`
        );

        // Create collections table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT,
            createdAt INTEGER NOT NULL
          );`
        );
      },
      (error) => {
        console.error('Error initializing database:', error);
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
}

export async function addItem(item: Omit<SavedItem, 'id'>): Promise<number> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO items (
            url, title, type, fileUri, thumbnailUri, source, createdAt,
            collectionId, duration, fileSize
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            item.url,
            item.title,
            item.type,
            item.fileUri,
            item.thumbnailUri,
            item.source,
            item.createdAt,
            item.collectionId,
            item.duration,
            item.fileSize,
          ],
          (_, result) => {
            resolve(result.insertId);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Error adding item:', error);
        reject(error);
      }
    );
  });
}

export async function getItems(filter?: {
  type?: string;
  collectionId?: number;
  search?: string;
}): Promise<SavedItem[]> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        let query = 'SELECT * FROM items';
        const params: any[] = [];

        if (filter) {
          const conditions: string[] = [];

          if (filter.type) {
            conditions.push('type = ?');
            params.push(filter.type);
          }

          if (filter.collectionId) {
            conditions.push('collectionId = ?');
            params.push(filter.collectionId);
          }

          if (filter.search) {
            conditions.push('(title LIKE ? OR source LIKE ?)');
            params.push(`%${filter.search}%`, `%${filter.search}%`);
          }

          if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
          }
        }

        query += ' ORDER BY createdAt DESC';

        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const items: SavedItem[] = [];
            for (let i = 0; i < rows.length; i++) {
              items.push(rows.item(i));
            }
            resolve(items);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Error getting items:', error);
        reject(error);
      }
    );
  });
}

export async function deleteItem(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM items WHERE id = ?;',
          [id],
          () => {
            resolve();
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Error deleting item:', error);
        reject(error);
      }
    );
  });
}

export async function addCollection(collection: Omit<Collection, 'id'>): Promise<number> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO collections (name, color, createdAt) VALUES (?, ?, ?);',
          [collection.name, collection.color, collection.createdAt],
          (_, result) => {
            resolve(result.insertId);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Error adding collection:', error);
        reject(error);
      }
    );
  });
}

export async function getCollections(): Promise<Collection[]> {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM collections ORDER BY createdAt DESC;',
          [],
          (_, { rows }) => {
            const collections: Collection[] = [];
            for (let i = 0; i < rows.length; i++) {
              collections.push(rows.item(i));
            }
            resolve(collections);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error('Error getting collections:', error);
        reject(error);
      }
    );
  });
}
