import * as SQLite from 'expo-sqlite';

export interface Book {
  id: number;
  title: string;
  author: string;
  filePath: string;
  format: string;
  coverPath?: string;
  dateAdded: number;
  lastOpened?: number;
  currentPage: number;
}

export interface Annotation {
  id: number;
  bookId: number;
  type: 'highlight' | 'bookmark' | 'note';
  location: string;
  text: string;
  color?: string;
  note?: string;
  createdAt: number;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('booknest.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      filePath TEXT NOT NULL UNIQUE,
      format TEXT NOT NULL,
      coverPath TEXT,
      dateAdded INTEGER NOT NULL,
      lastOpened INTEGER,
      currentPage INTEGER DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
    CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
    
    CREATE TABLE IF NOT EXISTS annotations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId INTEGER NOT NULL,
      type TEXT NOT NULL,
      location TEXT NOT NULL,
      text TEXT NOT NULL,
      color TEXT,
      note TEXT,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_annotations_bookId ON annotations(bookId);
    
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    
    CREATE TABLE IF NOT EXISTS book_collections (
      bookId INTEGER NOT NULL,
      collectionId INTEGER NOT NULL,
      PRIMARY KEY (bookId, collectionId),
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE
    );
  `);
}

export async function addBook(book: Omit<Book, 'id'>): Promise<number> {
  if (!db) throw new Error('Database not initialized');
  
  const result = await db.runAsync(
    `INSERT INTO books (title, author, filePath, format, coverPath, dateAdded, lastOpened, currentPage)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      book.title,
      book.author,
      book.filePath,
      book.format,
      book.coverPath || null,
      book.dateAdded,
      book.lastOpened || null,
      book.currentPage
    ]
  );
  
  return result.lastInsertRowId;
}

export async function getBooks(): Promise<Book[]> {
  if (!db) throw new Error('Database not initialized');
  
  const books = await db.getAllAsync<Book>(
    'SELECT * FROM books ORDER BY dateAdded DESC'
  );
  
  return books;
}

export async function getBook(id: number): Promise<Book | null> {
  if (!db) throw new Error('Database not initialized');
  
  const book = await db.getFirstAsync<Book>(
    'SELECT * FROM books WHERE id = ?',
    [id]
  );
  
  return book || null;
}

export async function updateBook(id: number, updates: Partial<Book>): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  const fields = Object.keys(updates).filter(k => k !== 'id');
  const values = fields.map(k => updates[k as keyof Book]);
  
  if (fields.length === 0) return;
  
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  
  await db.runAsync(
    `UPDATE books SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
}

export async function deleteBook(id: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  await db.runAsync('DELETE FROM books WHERE id = ?', [id]);
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!db) throw new Error('Database not initialized');
  
  const searchTerm = `%${query}%`;
  const books = await db.getAllAsync<Book>(
    'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY dateAdded DESC',
    [searchTerm, searchTerm]
  );
  
  return books;
}

export async function addAnnotation(annotation: Omit<Annotation, 'id'>): Promise<number> {
  if (!db) throw new Error('Database not initialized');
  
  const result = await db.runAsync(
    `INSERT INTO annotations (bookId, type, location, text, color, note, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      annotation.bookId,
      annotation.type,
      annotation.location,
      annotation.text,
      annotation.color || null,
      annotation.note || null,
      annotation.createdAt
    ]
  );
  
  return result.lastInsertRowId;
}

export async function getAnnotations(bookId: number): Promise<Annotation[]> {
  if (!db) throw new Error('Database not initialized');
  
  const annotations = await db.getAllAsync<Annotation>(
    'SELECT * FROM annotations WHERE bookId = ? ORDER BY createdAt DESC',
    [bookId]
  );
  
  return annotations;
}

export async function deleteAnnotation(id: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  await db.runAsync('DELETE FROM annotations WHERE id = ?', [id]);
}
