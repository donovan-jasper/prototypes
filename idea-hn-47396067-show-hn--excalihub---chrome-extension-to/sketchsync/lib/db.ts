import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('sketchsync.db');

export interface Drawing {
  id: number;
  title: string;
  data: string;
  thumbnail: string;
  created_at: string;
  updated_at: string;
}

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS drawings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        data TEXT NOT NULL,
        thumbnail TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        data TEXT NOT NULL,
        preview_url TEXT
      );`
    );
  });
};

export const createDrawing = (drawing: Partial<Drawing>): Promise<Drawing> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO drawings (title, data, thumbnail) VALUES (?, ?, ?)',
        [drawing.title, drawing.data, drawing.thumbnail],
        (_, result) => {
          resolve({
            id: result.insertId,
            ...drawing,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Drawing);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getDrawings = (): Promise<Drawing[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM drawings ORDER BY updated_at DESC',
        [],
        (_, { rows }) => resolve(rows._array as Drawing[]),
        (_, error) => reject(error)
      );
    });
  });
};

export const getDrawing = (id: number): Promise<Drawing> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM drawings WHERE id = ?',
        [id],
        (_, { rows }) => resolve(rows._array[0] as Drawing),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateDrawing = (id: number, updates: Partial<Drawing>): Promise<Drawing> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const setClause = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(updates), id];

      tx.executeSql(
        `UPDATE drawings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
        async () => {
          const updatedDrawing = await getDrawing(id);
          resolve(updatedDrawing);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteDrawing = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM drawings WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
