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

export const getAutoDownloadSettings = async () => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getFirstAsync(
    'SELECT * FROM user_settings WHERE id = 1;'
  );
  return result || { auto_download_enabled: 0, max_auto_downloads: 3 };
};

export const setAutoDownloadEnabled = async (enabled: boolean) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.runAsync(
    'INSERT OR REPLACE INTO user_settings (id, auto_download_enabled) VALUES (1, ?);',
    [enabled ? 1 : 0]
  );
};

export const triggerAutoDownload = async (contentId: number) => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const settings = await getAutoDownloadSettings();

  if (settings.auto_download_enabled) {
    // Get the series ID of the current content
    const currentContent = await getContent(contentId);
    if (!currentContent || !currentContent.series_id) return;

    // Get all chapters in the series
    const chapters = await getSeriesChapters(currentContent.series_id);

    // Find the next chapters to download
    const currentChapterIndex = chapters.findIndex(ch => ch.id === contentId);
    if (currentChapterIndex === -1) return;

    const nextChapters = chapters.slice(currentChapterIndex + 1, currentChapterIndex + 1 + settings.max_auto_downloads);

    // Download each chapter
    for (const chapter of nextChapters) {
      // Check if already downloaded
      const isDownloaded = await db.getFirstAsync(
        'SELECT 1 FROM content WHERE id = ?',
        [chapter.id]
      );

      if (!isDownloaded) {
        // In a real app, you would fetch the chapter content from a server
        // For this example, we'll just mark it as downloaded
        await db.runAsync(
          'INSERT INTO auto_download_queue (content_id, downloaded_at) VALUES (?, ?)',
          [chapter.id, Date.now()]
        );
      }
    }
  }
};

export const getAutoDownloadedContent = async () => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  const result = await db.getAllAsync(`
    SELECT
      c.id,
      c.title,
      ad.downloaded_at
    FROM auto_download_queue ad
    JOIN content c ON ad.content_id = c.id
    ORDER BY ad.downloaded_at DESC;
  `);
  return result;
};

export const clearAutoDownloadNotifications = async () => {
  const db = await SQLite.openDatabaseAsync('pageturner.db');
  await db.runAsync('DELETE FROM auto_download_queue;');
};
