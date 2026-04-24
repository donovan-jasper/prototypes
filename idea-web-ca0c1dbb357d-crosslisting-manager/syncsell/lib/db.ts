import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const db = SQLite.openDatabase('syncsell.db');

export const initDatabase = () => {
  db.transaction(tx => {
    // Products table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        inventory INTEGER NOT NULL,
        image_uri TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );`
    );

    // Platforms table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS platforms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        api_key TEXT NOT NULL,
        business_account_id TEXT,
        page_id TEXT,
        connected_at TEXT NOT NULL
      );`
    );

    // Sales table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        platform_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        sold_at TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (platform_id) REFERENCES platforms (id)
      );`
    );

    // Messages table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL,
        buyer_name TEXT NOT NULL,
        content TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        received_at TEXT NOT NULL,
        FOREIGN KEY (platform_id) REFERENCES platforms (id)
      );`
    );

    // Queue table for offline posts
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        platforms TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id)
      );`
    );
  });
};

// Product operations
export const addProduct = (product: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO products (title, description, price, inventory, image_uri, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          product.title,
          product.description || '',
          parseFloat(product.price),
          parseInt(product.inventory),
          product.imageUri,
          new Date().toISOString(),
          new Date().toISOString()
        ],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getProducts = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM products ORDER BY created_at DESC;`,
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateProduct = (product: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE products
         SET title = ?, description = ?, price = ?, inventory = ?, image_uri = ?, updated_at = ?
         WHERE id = ?;`,
        [
          product.title,
          product.description || '',
          parseFloat(product.price),
          parseInt(product.inventory),
          product.imageUri,
          new Date().toISOString(),
          product.id
        ],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteProduct = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM products WHERE id = ?;`,
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

// Platform operations
export const addPlatform = (platform: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO platforms (name, api_key, business_account_id, page_id, connected_at)
         VALUES (?, ?, ?, ?, ?);`,
        [
          platform.name,
          platform.apiKey,
          platform.businessAccountId || null,
          platform.pageId || null,
          new Date().toISOString()
        ],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getPlatforms = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM platforms ORDER BY connected_at DESC;`,
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const deletePlatform = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM platforms WHERE id = ?;`,
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

// Sale operations
export const addSale = (sale: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO sales (product_id, platform_id, amount, sold_at)
         VALUES (?, ?, ?, ?);`,
        [
          sale.productId,
          sale.platformId,
          parseFloat(sale.amount),
          new Date().toISOString()
        ],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSales = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM sales ORDER BY sold_at DESC;`,
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

// Message operations
export const addMessage = (message: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO messages (platform_id, buyer_name, content, read, received_at)
         VALUES (?, ?, ?, ?, ?);`,
        [
          message.platformId,
          message.buyerName,
          message.content,
          message.read ? 1 : 0,
          new Date().toISOString()
        ],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getMessages = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM messages ORDER BY received_at DESC;`,
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const markMessageAsRead = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE messages SET read = 1 WHERE id = ?;`,
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

// Queue operations
export const addToQueue = (item: any): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO queue (product_id, platforms, timestamp)
         VALUES (?, ?, ?);`,
        [
          item.productId,
          JSON.stringify(item.platforms),
          new Date().toISOString()
        ],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getQueue = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM queue ORDER BY timestamp ASC;`,
        [],
        (_, { rows: { _array } }) => {
          const parsedQueue = _array.map(item => ({
            ...item,
            platforms: JSON.parse(item.platforms)
          }));
          resolve(parsedQueue);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const removeFromQueue = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM queue WHERE id = ?;`,
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
