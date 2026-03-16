import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('soundmap.db');

export const searchProducts = (query, category = '', maxPrice = 10000) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM products
         WHERE name LIKE ? AND category LIKE ? AND price <= ?
         ORDER BY name ASC;`,
        [`%${query}%`, `%${category}%`, maxPrice],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getProductById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM products WHERE id = ?;`,
        [id],
        (_, { rows }) => resolve(rows._array[0]),
        (_, error) => reject(error)
      );
    });
  });
};

export const addProduct = (product) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO products (id, name, category, brand, impedance, power, connections, price, imageUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [product.id, product.name, product.category, product.brand, product.impedance, product.power, JSON.stringify(product.connections), product.price, product.imageUrl],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUserSystems = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM systems ORDER BY updatedAt DESC;`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const saveSystem = (system) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO systems (id, name, createdAt, updatedAt)
         VALUES (?, ?, ?, ?);`,
        [system.id, system.name, system.createdAt, system.updatedAt],
        (_, result) => {
          system.components.forEach((component, index) => {
            tx.executeSql(
              `INSERT OR REPLACE INTO systemComponents (systemId, productId, quantity, position)
               VALUES (?, ?, ?, ?);`,
              [system.id, component.productId, component.quantity, index]
            );
          });
          resolve(result);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteSystem = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM systems WHERE id = ?;`,
        [id],
        (_, result) => {
          tx.executeSql(
            `DELETE FROM systemComponents WHERE systemId = ?;`,
            [id]
          );
          resolve(result);
        },
        (_, error) => reject(error)
      );
    });
  });
};
