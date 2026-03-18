import * as SQLite from 'expo-sqlite';

export const downloadContent = async (content: { title: string; text: string }) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      title TEXT, 
      text TEXT
    );
    CREATE TABLE IF NOT EXISTS reading_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      scroll_position REAL DEFAULT 0,
      percentage_complete REAL DEFAULT 0,
      last_updated INTEGER NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id)
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      comment_text TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id)
    );
  `);
  const result = await db.runAsync(
    'INSERT INTO content (title, text) VALUES (?, ?);',
    [content.title, content.text]
  );
  
  // Initialize progress for new content
  await db.runAsync(
    'INSERT INTO reading_progress (content_id, scroll_position, percentage_complete, last_updated) VALUES (?, 0, 0, ?);',
    [result.lastInsertRowId, Date.now()]
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

export const saveReadingProgress = async (contentId: number, scrollPosition: number, percentageComplete: number) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.runAsync(
    `INSERT OR REPLACE INTO reading_progress (id, content_id, scroll_position, percentage_complete, last_updated)
     VALUES (
       (SELECT id FROM reading_progress WHERE content_id = ?),
       ?, ?, ?, ?
     );`,
    [contentId, contentId, scrollPosition, percentageComplete, Date.now()]
  );
};

export const getReadingProgress = async (contentId: number) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getFirstAsync(
    'SELECT * FROM reading_progress WHERE content_id = ?;',
    [contentId]
  );
  return result || { scroll_position: 0, percentage_complete: 0 };
};

export const getAllContentWithProgress = async () => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getAllAsync(`
    SELECT 
      c.id,
      c.title,
      c.text,
      COALESCE(rp.scroll_position, 0) as scroll_position,
      COALESCE(rp.percentage_complete, 0) as percentage_complete
    FROM content c
    LEFT JOIN reading_progress rp ON c.id = rp.content_id
    ORDER BY c.id DESC;
  `);
  return result;
};

export const addComment = async (contentId: number, authorName: string, commentText: string) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.runAsync(
    'INSERT INTO comments (content_id, author_name, comment_text, timestamp) VALUES (?, ?, ?, ?);',
    [contentId, authorName, commentText, Date.now()]
  );
};

export const getComments = async (contentId: number) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getAllAsync(
    'SELECT * FROM comments WHERE content_id = ? ORDER BY timestamp DESC;',
    [contentId]
  );
  return result;
};

export const getAllContent = async () => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getAllAsync('SELECT id, title FROM content ORDER BY id DESC;');
  return result;
};
