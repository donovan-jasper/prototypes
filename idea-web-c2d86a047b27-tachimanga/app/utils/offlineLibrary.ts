import * as SQLite from 'expo-sqlite';

export const downloadContent = async (content: { 
  title: string; 
  text: string;
  seriesId?: string;
  seriesTitle?: string;
  chapterNumber?: number;
}) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      title TEXT,
      text TEXT,
      series_id TEXT,
      series_title TEXT,
      chapter_number INTEGER
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
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      auto_download_enabled INTEGER DEFAULT 0,
      max_auto_downloads INTEGER DEFAULT 3
    );
    CREATE TABLE IF NOT EXISTS auto_download_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_id INTEGER NOT NULL,
      downloaded_at INTEGER NOT NULL,
      FOREIGN KEY (content_id) REFERENCES content(id)
    );
  `);
  const result = await db.runAsync(
    'INSERT INTO content (title, text, series_id, series_title, chapter_number) VALUES (?, ?, ?, ?, ?);',
    [content.title, content.text, content.seriesId || null, content.seriesTitle || null, content.chapterNumber || null]
  );
  
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

  if (percentageComplete >= 90) {
    await triggerAutoDownload(contentId);
  }
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
      c.series_id,
      c.series_title,
      c.chapter_number,
      COALESCE(rp.scroll_position, 0) as scroll_position,
      COALESCE(rp.percentage_complete, 0) as percentage_complete
    FROM content c
    LEFT JOIN reading_progress rp ON c.id = rp.content_id
    ORDER BY c.series_title, c.chapter_number;
  `);
  return result;
};

export const getSeriesChapters = async (seriesId: string) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getAllAsync(`
    SELECT 
      c.id,
      c.title,
      c.text,
      c.series_id,
      c.series_title,
      c.chapter_number,
      COALESCE(rp.scroll_position, 0) as scroll_position,
      COALESCE(rp.percentage_complete, 0) as percentage_complete,
      CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END as is_downloaded
    FROM content c
    LEFT JOIN reading_progress rp ON c.id = rp.content_id
    WHERE c.series_id = ?
    ORDER BY c.chapter_number;
  `, [seriesId]);
  return result;
};

export const getInProgressContent = async () => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getAllAsync(`
    SELECT 
      c.id,
      c.title,
      c.text,
      c.series_title,
      c.chapter_number,
      rp.scroll_position,
      rp.percentage_complete,
      rp.last_updated
    FROM content c
    INNER JOIN reading_progress rp ON c.id = rp.content_id
    WHERE rp.percentage_complete > 0 AND rp.percentage_complete < 100
    ORDER BY rp.last_updated DESC
    LIMIT 5;
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

export const getAutoDownloadSettings = async () => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.runAsync(
    'INSERT OR IGNORE INTO user_settings (id, auto_download_enabled, max_auto_downloads) VALUES (1, 0, 3);'
  );
  const result = await db.getFirstAsync('SELECT * FROM user_settings WHERE id = 1;');
  return result as { auto_download_enabled: number; max_auto_downloads: number };
};

export const setAutoDownloadEnabled = async (enabled: boolean) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.runAsync(
    'UPDATE user_settings SET auto_download_enabled = ? WHERE id = 1;',
    [enabled ? 1 : 0]
  );
};

export const setMaxAutoDownloads = async (max: number) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.runAsync(
    'UPDATE user_settings SET max_auto_downloads = ? WHERE id = 1;',
    [max]
  );
};

export const getAutoDownloadedContent = async () => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getAllAsync(`
    SELECT 
      c.id,
      c.title,
      adq.downloaded_at
    FROM auto_download_queue adq
    INNER JOIN content c ON adq.content_id = c.id
    ORDER BY adq.downloaded_at DESC;
  `);
  return result;
};

export const clearAutoDownloadQueue = async () => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.runAsync('DELETE FROM auto_download_queue;');
};

const triggerAutoDownload = async (currentContentId: number) => {
  const settings = await getAutoDownloadSettings();
  if (!settings.auto_download_enabled) return;

  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const queueCount = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM auto_download_queue;'
  ) as { count: number };

  if (queueCount.count >= settings.max_auto_downloads) {
    const oldest = await db.getFirstAsync(
      'SELECT id FROM auto_download_queue ORDER BY downloaded_at ASC LIMIT 1;'
    ) as { id: number };
    await db.runAsync('DELETE FROM auto_download_queue WHERE id = ?;', [oldest.id]);
  }

  await db.runAsync(
    'INSERT INTO auto_download_queue (content_id, downloaded_at) VALUES (?, ?);',
    [currentContentId, Date.now()]
  );
};
