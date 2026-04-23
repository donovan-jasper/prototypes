import * as SQLite from 'expo-sqlite';
import { Listing, Platform, SyncQueueItem } from '../types';

const db = SQLite.openDatabase('sellsync.db');

export const initDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      // Create listings table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS listings (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          images TEXT,
          platforms TEXT,
          syncStatus TEXT,
          attributes TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => {
          // Create platforms table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS platforms (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              apiToken TEXT,
              enabled INTEGER DEFAULT 1
            );`,
            [],
            () => {
              // Create sync queue table
              tx.executeSql(
                `CREATE TABLE IF NOT EXISTS sync_queue (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  listingId TEXT,
                  platform TEXT NOT NULL,
                  action TEXT NOT NULL,
                  listingData TEXT,
                  status TEXT DEFAULT 'pending',
                  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
                );`,
                [],
                () => resolve(),
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const addListing = async (listing: Listing) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO listings (
          id, title, description, price, quantity, images, platforms, syncStatus, attributes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          listing.id,
          listing.title,
          listing.description,
          listing.price,
          listing.quantity,
          JSON.stringify(listing.images),
          JSON.stringify(listing.platforms),
          listing.syncStatus,
          JSON.stringify(listing.attributes)
        ],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateListing = async (listing: Listing) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE listings SET
          title = ?,
          description = ?,
          price = ?,
          quantity = ?,
          images = ?,
          platforms = ?,
          syncStatus = ?,
          attributes = ?
        WHERE id = ?;`,
        [
          listing.title,
          listing.description,
          listing.price,
          listing.quantity,
          JSON.stringify(listing.images),
          JSON.stringify(listing.platforms),
          listing.syncStatus,
          JSON.stringify(listing.attributes),
          listing.id
        ],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteListing = async (id: string) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM listings WHERE id = ?;`,
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getListings = async (): Promise<Listing[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM listings;`,
        [],
        (_, { rows }) => {
          const listings: Listing[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            listings.push({
              id: row.id,
              title: row.title,
              description: row.description,
              price: row.price,
              quantity: row.quantity,
              images: JSON.parse(row.images),
              platforms: JSON.parse(row.platforms),
              syncStatus: row.syncStatus,
              attributes: JSON.parse(row.attributes)
            });
          }
          resolve(listings);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const addSyncQueueItem = async (item: SyncQueueItem) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO sync_queue (
          listingId, platform, action, listingData, status
        ) VALUES (?, ?, ?, ?, ?);`,
        [
          item.listingId,
          item.platform,
          item.action,
          JSON.stringify(item.listing),
          item.status || 'pending'
        ],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM sync_queue WHERE status = 'pending';`,
        [],
        (_, { rows }) => {
          const queue: SyncQueueItem[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            queue.push({
              id: row.id,
              listingId: row.listingId,
              platform: row.platform,
              action: row.action,
              listing: JSON.parse(row.listingData),
              status: row.status
            });
          }
          resolve(queue);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const clearSyncQueue = async (id?: number) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      if (id) {
        tx.executeSql(
          `DELETE FROM sync_queue WHERE id = ?;`,
          [id],
          () => resolve(),
          (_, error) => reject(error)
        );
      } else {
        tx.executeSql(
          `DELETE FROM sync_queue WHERE status != 'pending';`,
          [],
          () => resolve(),
          (_, error) => reject(error)
        );
      }
    });
  });
};
