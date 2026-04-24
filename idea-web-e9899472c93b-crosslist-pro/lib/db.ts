import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('listsync.db');

export const openDatabase = () => {
  return db;
};

export const initializeDatabase = async () => {
  try {
    await db.transactionAsync(async (tx) => {
      await tx.executeSqlAsync(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          imageUri TEXT,
          platforms TEXT,
          isDraft INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL
        );
      `);
    });
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

export const createProduct = async (productData: {
  title: string;
  description: string;
  price: number;
  quantity: number;
  imageUri?: string;
  platforms: string[];
  isDraft: boolean;
}) => {
  try {
    const result = await db.transactionAsync(async (tx) => {
      const insertResult = await tx.executeSqlAsync(
        'INSERT INTO products (title, description, price, quantity, imageUri, platforms, isDraft, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          productData.title,
          productData.description,
          productData.price,
          productData.quantity,
          productData.imageUri || '',
          JSON.stringify(productData.platforms),
          productData.isDraft ? 1 : 0,
          new Date().toISOString(),
        ]
      );
      return insertResult;
    });

    return result;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
};

export const getProducts = async () => {
  try {
    const result = await db.transactionAsync(async (tx) => {
      const queryResult = await tx.executeSqlAsync('SELECT * FROM products ORDER BY createdAt DESC');
      return queryResult;
    });

    if (result.rows && result.rows._array) {
      return result.rows._array.map((row: any) => ({
        ...row,
        platforms: row.platforms ? JSON.parse(row.platforms) : [],
        isDraft: row.isDraft === 1,
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

export const updateProduct = async (id: number, updates: Partial<{
  title: string;
  description: string;
  price: number;
  quantity: number;
  imageUri: string;
  platforms: string[];
  isDraft: boolean;
}>) => {
  try {
    const setClauses = [];
    const params = [];

    if (updates.title !== undefined) {
      setClauses.push('title = ?');
      params.push(updates.title);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      params.push(updates.description);
    }
    if (updates.price !== undefined) {
      setClauses.push('price = ?');
      params.push(updates.price);
    }
    if (updates.quantity !== undefined) {
      setClauses.push('quantity = ?');
      params.push(updates.quantity);
    }
    if (updates.imageUri !== undefined) {
      setClauses.push('imageUri = ?');
      params.push(updates.imageUri);
    }
    if (updates.platforms !== undefined) {
      setClauses.push('platforms = ?');
      params.push(JSON.stringify(updates.platforms));
    }
    if (updates.isDraft !== undefined) {
      setClauses.push('isDraft = ?');
      params.push(updates.isDraft ? 1 : 0);
    }

    if (setClauses.length === 0) return;

    params.push(id);

    await db.transactionAsync(async (tx) => {
      await tx.executeSqlAsync(
        `UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`,
        params
      );
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: number) => {
  try {
    await db.transactionAsync(async (tx) => {
      await tx.executeSqlAsync('DELETE FROM products WHERE id = ?', [id]);
    });
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw error;
  }
};
