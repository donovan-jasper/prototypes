import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('pagebridge.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      isbn TEXT,
      totalPages INTEGER,
      currentPage INTEGER DEFAULT 0,
      lastSynced INTEGER,
      createdAt INTEGER DEFAULT (strftime('%s', 'now'))
    );
    
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId TEXT,
      action TEXT,
      data TEXT,
      createdAt INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);
};

export const addBook = async (book: {
  title: string;
  author?: string;
  isbn?: string;
  totalPages?: number;
}) => {
  const id = `book_${Date.now()}`;
  await db.runAsync(
    'INSERT INTO books (id, title, author, isbn, totalPages) VALUES (?, ?, ?, ?, ?)',
    [id, book.title, book.author || '', book.isbn || '', book.totalPages || 0]
  );
  return { id, ...book, currentPage: 0, lastSynced: Date.now() };
};

export const updateProgress = async (bookId: string, page: number) => {
  await db.runAsync(
    'UPDATE books SET currentPage = ?, lastSynced = ? WHERE id = ?',
    [page, Date.now(), bookId]
  );
};

export const getBooks = async () => {
  const result = await db.getAllAsync('SELECT * FROM books ORDER BY lastSynced DESC');
  return result as any[];
};

export const getBook = async (id: string) => {
  return await db.getFirstAsync('SELECT * FROM books WHERE id = ?', [id]);
};

export const searchBooksByTitle = async (searchTerm: string) => {
  const result = await db.getAllAsync(
    'SELECT * FROM books WHERE title LIKE ? ORDER BY title',
    [`%${searchTerm}%`]
  );
  return result as any[];
};
