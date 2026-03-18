import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('syncsell.db');

export const initDB = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_uri TEXT,
        inventory INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS platforms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        api_key TEXT NOT NULL,
        connected_at TEXT NOT NULL
      );`
    );
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
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL,
        buyer_name TEXT NOT NULL,
        content TEXT NOT NULL,
        read INTEGER NOT NULL DEFAULT 0,
        received_at TEXT NOT NULL,
        FOREIGN KEY (platform_id) REFERENCES platforms (id)
      );`
    );
  });
};

export const seedMockMessages = () => {
  getPlatforms((platforms) => {
    if (platforms.length === 0) return;
    
    getMessages((existingMessages) => {
      if (existingMessages.length > 0) return;
      
      const mockMessages = [
        {
          platformId: platforms[0].id,
          buyerName: 'Sarah Johnson',
          content: 'Hi! Is this item still available? I\'m very interested!',
          read: 0,
          receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          platformId: platforms[0].id,
          buyerName: 'Mike Chen',
          content: 'Can you ship to Canada? How much would that cost?',
          read: 0,
          receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          platformId: platforms.length > 1 ? platforms[1].id : platforms[0].id,
          buyerName: 'Emma Davis',
          content: 'I bought this yesterday. When will it ship?',
          read: 1,
          receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          platformId: platforms[0].id,
          buyerName: 'Alex Rodriguez',
          content: 'Do you have this in a different color?',
          read: 0,
          receivedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          platformId: platforms.length > 1 ? platforms[1].id : platforms[0].id,
          buyerName: 'Lisa Wang',
          content: 'Great product! Would you consider a bundle discount if I buy 3?',
          read: 1,
          receivedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      mockMessages.forEach((msg) => {
        addMessage(msg, () => {});
      });
    });
  });
};

export const addProduct = (product, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT INTO products (title, description, price, image_uri, inventory, created_at) VALUES (?, ?, ?, ?, ?, ?);',
      [product.title, product.description, product.price, product.imageUri, product.inventory, product.createdAt],
      (_, { insertId }) => callback(insertId),
      (_, error) => console.log(error)
    );
  });
};

export const updateProduct = (product, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE products SET title = ?, description = ?, price = ?, image_uri = ?, inventory = ? WHERE id = ?;',
      [product.title, product.description, product.price, product.imageUri, product.inventory, product.id],
      (_, result) => callback(result),
      (_, error) => console.log(error)
    );
  });
};

export const deleteProduct = (id, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'DELETE FROM products WHERE id = ?;',
      [id],
      (_, result) => callback(result),
      (_, error) => console.log(error)
    );
  });
};

export const getProducts = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM products;',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => console.log(error)
    );
  });
};

export const connectPlatform = (platform, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT INTO platforms (name, api_key, connected_at) VALUES (?, ?, ?);',
      [platform.name, platform.apiKey, platform.connectedAt],
      (_, { insertId }) => callback(insertId),
      (_, error) => console.log(error)
    );
  });
};

export const disconnectPlatform = (id, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'DELETE FROM platforms WHERE id = ?;',
      [id],
      (_, result) => callback(result),
      (_, error) => console.log(error)
    );
  });
};

export const getPlatforms = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM platforms;',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => console.log(error)
    );
  });
};

export const recordSale = (sale, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT INTO sales (product_id, platform_id, amount, sold_at) VALUES (?, ?, ?, ?);',
      [sale.productId, sale.platformId, sale.amount, sale.soldAt],
      (_, { insertId }) => callback(insertId),
      (_, error) => console.log(error)
    );
  });
};

export const getSales = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM sales;',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => console.log(error)
    );
  });
};

export const addMessage = (message, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT INTO messages (platform_id, buyer_name, content, read, received_at) VALUES (?, ?, ?, ?, ?);',
      [message.platformId, message.buyerName, message.content, message.read, message.receivedAt],
      (_, { insertId }) => callback(insertId),
      (_, error) => console.log(error)
    );
  });
};

export const markMessageAsRead = (id, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'UPDATE messages SET read = 1 WHERE id = ?;',
      [id],
      (_, result) => callback(result),
      (_, error) => console.log(error)
    );
  });
};

export const getMessages = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM messages ORDER BY received_at DESC;',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => console.log(error)
    );
  });
};
