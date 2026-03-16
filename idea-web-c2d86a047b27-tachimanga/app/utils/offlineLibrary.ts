import * as SQLite from 'expo-sqlite';

export const downloadContent = async (content: { title: string; text: string }) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      title TEXT, 
      text TEXT
    );
  `);
  const result = await db.runAsync(
    'INSERT INTO content (title, text) VALUES (?, ?);',
    [content.title, content.text]
  );
  return { ...content, localPath: result.lastInsertRowId };
};

export const getContent = async (id: number) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getFirstAsync(
    'SELECT * FROM content WHERE id = ?;',
    [id]
  );
  return result;
};
