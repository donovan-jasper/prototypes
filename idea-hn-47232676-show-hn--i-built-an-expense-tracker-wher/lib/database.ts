import { SQLiteProvider, useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

export { SQLiteProvider, useSQLiteContext };

export const initializeDatabase = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        paidBy TEXT NOT NULL,
        splitWith TEXT NOT NULL,
        date TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        syncStatus TEXT NOT NULL DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        publicKey TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceId TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        action TEXT NOT NULL,
        recordId INTEGER,
        recordType TEXT NOT NULL,
        syncStatus TEXT NOT NULL DEFAULT 'pending'
      );

      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_expenses_paidBy ON expenses(paidBy);
      CREATE INDEX IF NOT EXISTS idx_expenses_syncStatus ON expenses(syncStatus);
      CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp ON sync_log(timestamp);
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const addExpense = async (db: SQLiteDatabase, expense: {
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  splitWith: string[];
  date: string;
}) => {
  try {
    const now = Date.now();
    const result = await db.runAsync(
      `INSERT INTO expenses (description, amount, category, paidBy, splitWith, date, createdAt, updatedAt, syncStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense.description,
        expense.amount,
        expense.category,
        expense.paidBy,
        JSON.stringify(expense.splitWith),
        expense.date,
        now,
        now,
        'pending'
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const getExpenses = async (db: SQLiteDatabase) => {
  try {
    const result = await db.getAllAsync<{
      id: number;
      description: string;
      amount: number;
      category: string;
      paidBy: string;
      splitWith: string;
      date: string;
      createdAt: number;
      updatedAt: number;
      syncStatus: string;
    }>('SELECT * FROM expenses ORDER BY date DESC');
    
    return result.map(row => ({
      ...row,
      splitWith: JSON.parse(row.splitWith)
    }));
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

export const updateExpense = async (db: SQLiteDatabase, id: number, expense: {
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  splitWith: string[];
  date: string;
}) => {
  try {
    const now = Date.now();
    await db.runAsync(
      `UPDATE expenses 
       SET description = ?, amount = ?, category = ?, paidBy = ?, splitWith = ?, date = ?, updatedAt = ?, syncStatus = ?
       WHERE id = ?`,
      [
        expense.description,
        expense.amount,
        expense.category,
        expense.paidBy,
        JSON.stringify(expense.splitWith),
        expense.date,
        now,
        'pending',
        id
      ]
    );
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (db: SQLiteDatabase, id: number) => {
  try {
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const getBalance = async (db: SQLiteDatabase, user1: string, user2: string) => {
  try {
    const expenses = await getExpenses(db);
    
    let user1Paid = 0;
    let user2Paid = 0;
    let user1Owes = 0;
    let user2Owes = 0;

    expenses.forEach(expense => {
      const splitCount = expense.splitWith.length;
      const shareAmount = expense.amount / splitCount;

      if (expense.paidBy === user1) {
        user1Paid += expense.amount;
        if (expense.splitWith.includes(user2)) {
          user2Owes += shareAmount;
        }
      } else if (expense.paidBy === user2) {
        user2Paid += expense.amount;
        if (expense.splitWith.includes(user1)) {
          user1Owes += shareAmount;
        }
      }
    });

    return user1Paid - user1Owes - (user2Paid - user2Owes);
  } catch (error) {
    console.error('Error calculating balance:', error);
    throw error;
  }
};

export const addUser = async (db: SQLiteDatabase, user: {
  id: string;
  name: string;
  publicKey: string;
}) => {
  try {
    const now = Date.now();
    await db.runAsync(
      'INSERT OR REPLACE INTO users (id, name, publicKey, createdAt) VALUES (?, ?, ?, ?)',
      [user.id, user.name, user.publicKey, now]
    );
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const getUsers = async (db: SQLiteDatabase) => {
  try {
    return await db.getAllAsync<{
      id: string;
      name: string;
      publicKey: string;
      createdAt: number;
    }>('SELECT * FROM users');
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const addSyncLog = async (db: SQLiteDatabase, log: {
  deviceId: string;
  action: string;
  recordId?: number;
  recordType: string;
}) => {
  try {
    const now = Date.now();
    await db.runAsync(
      'INSERT INTO sync_log (deviceId, timestamp, action, recordId, recordType, syncStatus) VALUES (?, ?, ?, ?, ?, ?)',
      [log.deviceId, now, log.action, log.recordId || null, log.recordType, 'pending']
    );
  } catch (error) {
    console.error('Error adding sync log:', error);
    throw error;
  }
};
