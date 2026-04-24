import { openDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import type { Expense } from './types';

let db: SQLiteDatabase | null = null;

export const openDatabase = async (name: string = 'pairpurse.db') => {
  if (db) return db;

  db = await openDatabaseAsync(name);
  await initializeDatabase(db);
  return db;
};

const initializeDatabase = async (database: SQLiteDatabase) => {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      description TEXT,
      category TEXT,
      paidBy TEXT NOT NULL,
      splitWith TEXT NOT NULL,
      date TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      isCurrentUser INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      changes TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_paidBy ON expenses(paidBy);
  `);
};

export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const database = db || await openDatabase();
  const id = Math.random().toString(36).substring(2, 15);
  const now = Date.now();

  await database.runAsync(
    'INSERT INTO expenses (id, amount, description, category, paidBy, splitWith, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      id,
      expense.amount,
      expense.description,
      expense.category,
      expense.paidBy,
      JSON.stringify(expense.splitWith),
      expense.date,
      now,
      now,
    ]
  );

  return id;
};

export const updateExpense = async (id: string, expense: Partial<Expense>) => {
  const database = db || await openDatabase();
  const now = Date.now();

  const updates = [];
  const params = [];

  if (expense.amount !== undefined) {
    updates.push('amount = ?');
    params.push(expense.amount);
  }
  if (expense.description !== undefined) {
    updates.push('description = ?');
    params.push(expense.description);
  }
  if (expense.category !== undefined) {
    updates.push('category = ?');
    params.push(expense.category);
  }
  if (expense.paidBy !== undefined) {
    updates.push('paidBy = ?');
    params.push(expense.paidBy);
  }
  if (expense.splitWith !== undefined) {
    updates.push('splitWith = ?');
    params.push(JSON.stringify(expense.splitWith));
  }
  if (expense.date !== undefined) {
    updates.push('date = ?');
    params.push(expense.date);
  }

  updates.push('updatedAt = ?');
  params.push(now);

  params.push(id);

  await database.runAsync(
    `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`,
    params
  );
};

export const deleteExpense = async (id: string) => {
  const database = db || await openDatabase();
  await database.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
};

export const getExpenses = async (): Promise<Expense[]> => {
  const database = db || await openDatabase();
  const result = await database.getAllAsync<Expense>('SELECT * FROM expenses ORDER BY date DESC');

  return result.map(expense => ({
    ...expense,
    splitWith: JSON.parse(expense.splitWith as unknown as string),
  }));
};

export const getBalance = async (userId: string): Promise<number> => {
  const database = db || await openDatabase();

  // Calculate total amount paid by this user
  const paidResult = await database.getFirstAsync<{ total: number }>(
    'SELECT SUM(amount) as total FROM expenses WHERE paidBy = ?',
    [userId]
  );

  // Calculate total amount this user should pay (based on split ratios)
  const splitResult = await database.getAllAsync<{ amount: number; splitWith: string }>(
    'SELECT amount, splitWith FROM expenses WHERE splitWith LIKE ?',
    [`%${userId}%`]
  );

  let totalPaid = paidResult?.total || 0;
  let totalOwed = 0;

  for (const expense of splitResult) {
    const splitWith = JSON.parse(expense.splitWith);
    const splitCount = splitWith.length;
    const amountPerPerson = expense.amount / splitCount;

    // If this user is in the split, add their portion to totalOwed
    if (splitWith.includes(userId)) {
      totalOwed += amountPerPerson;
    }
  }

  // Net balance is what this user paid minus what they should have paid
  return totalPaid - totalOwed;
};

export const addUser = async (user: { id: string; name: string; isCurrentUser: boolean }) => {
  const database = db || await openDatabase();
  await database.runAsync(
    'INSERT INTO users (id, name, isCurrentUser) VALUES (?, ?, ?)',
    [user.id, user.name, user.isCurrentUser ? 1 : 0]
  );
};

export const getUsers = async (): Promise<{ id: string; name: string; isCurrentUser: boolean }[]> => {
  const database = db || await openDatabase();
  const result = await database.getAllAsync<{ id: string; name: string; isCurrentUser: number }>(
    'SELECT id, name, isCurrentUser FROM users'
  );

  return result.map(user => ({
    ...user,
    isCurrentUser: user.isCurrentUser === 1,
  }));
};

export const logSync = async (deviceId: string, changes: any) => {
  const database = db || await openDatabase();
  await database.runAsync(
    'INSERT INTO sync_log (deviceId, timestamp, changes) VALUES (?, ?, ?)',
    [deviceId, Date.now(), JSON.stringify(changes)]
  );
};

export const getSyncLog = async (): Promise<{ id: number; deviceId: string; timestamp: number; changes: any }[]> => {
  const database = db || await openDatabase();
  const result = await database.getAllAsync<{ id: number; deviceId: string; timestamp: number; changes: string }>(
    'SELECT * FROM sync_log ORDER BY timestamp DESC'
  );

  return result.map(log => ({
    ...log,
    changes: JSON.parse(log.changes),
  }));
};

export const useSQLiteContext = () => {
  if (!db) {
    throw new Error('Database not initialized. Call openDatabase() first.');
  }
  return db;
};
