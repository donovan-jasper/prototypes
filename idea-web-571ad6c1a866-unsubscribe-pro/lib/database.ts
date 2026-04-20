import * as SQLite from 'expo-sqlite';
import { Email, Sender } from '../types';

const DB_NAME = 'inboxzen.db';

interface Database {
  execAsync: (sql: string, params?: any[]) => Promise<SQLite.SQLResultSet>;
  getAll: (sql: string, params?: any[]) => Promise<any[]>;
  getFirst: (sql: string, params?: any[]) => Promise<any>;
  getFirstValue: (sql: string, params?: any[]) => Promise<any>;
}

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const db = SQLite.openDatabase(DB_NAME);

  // Initialize database schema
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      from TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      date TEXT NOT NULL,
      headers TEXT NOT NULL,
      classification TEXT,
      tags TEXT,
      unsubscribed INTEGER DEFAULT 0,
      processed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS senders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL UNIQUE,
      name TEXT,
      email_count INTEGER DEFAULT 0,
      last_email_date TEXT,
      classification TEXT,
      tags TEXT
    );

    CREATE TABLE IF NOT EXISTS unsubscribe_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id TEXT NOT NULL,
      action TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email_id) REFERENCES emails(id)
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      total_unsubscribed INTEGER DEFAULT 0,
      total_emails INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS weekly_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      score INTEGER NOT NULL,
      unsubscribed INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_provider TEXT,
      last_scan_date TEXT,
      auto_unsubscribe INTEGER DEFAULT 0,
      notification_enabled INTEGER DEFAULT 1
    );

    INSERT OR IGNORE INTO user_stats (id, streak, last_active_date, total_unsubscribed, total_emails)
    VALUES (1, 0, NULL, 0, 0);

    INSERT OR IGNORE INTO user_settings (id, email_provider, last_scan_date, auto_unsubscribe, notification_enabled)
    VALUES (1, NULL, NULL, 0, 1);
  `);

  dbInstance = {
    execAsync: (sql: string, params: any[] = []) => {
      return new Promise((resolve, reject) => {
        db.exec([{ sql, args: params }], false, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        });
      });
    },

    getAll: (sql: string, params: any[] = []) => {
      return new Promise((resolve, reject) => {
        db.exec([{ sql, args: params }], false, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result[0]?.rows || []);
        });
      });
    },

    getFirst: (sql: string, params: any[] = []) => {
      return new Promise((resolve, reject) => {
        db.exec([{ sql, args: params }], false, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result[0]?.rows?.[0] || null);
        });
      });
    },

    getFirstValue: (sql: string, params: any[] = []) => {
      return new Promise((resolve, reject) => {
        db.exec([{ sql, args: params }], false, (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          const row = result[0]?.rows?.[0];
          if (!row) {
            resolve(null);
            return;
          }
          // Return the first value of the first row
          resolve(Object.values(row)[0]);
        });
      });
    },
  };

  return dbInstance;
}

export async function saveEmails(emails: Email[]): Promise<void> {
  const db = await getDatabase();

  // Begin transaction
  await db.execAsync('BEGIN TRANSACTION');

  try {
    for (const email of emails) {
      // Insert or update email
      await db.execAsync(
        `INSERT OR REPLACE INTO emails
        (id, from, subject, body, date, headers, classification, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email.id,
          email.from,
          email.subject,
          email.body,
          email.date,
          JSON.stringify(email.headers),
          email.classification,
          JSON.stringify(email.tags)
        ]
      );

      // Update sender statistics
      const domain = email.from.split('@')[1];
      await db.execAsync(
        `INSERT OR REPLACE INTO senders
        (domain, name, email_count, last_email_date, classification, tags)
        VALUES (?, ?, COALESCE((SELECT email_count FROM senders WHERE domain = ?) + 1, 1),
                ?, ?, ?)`,
        [
          domain,
          domain, // Using domain as name for now
          domain,
          email.date,
          email.classification,
          JSON.stringify(email.tags)
        ]
      );
    }

    // Commit transaction
    await db.execAsync('COMMIT');
  } catch (error) {
    // Rollback on error
    await db.execAsync('ROLLBACK');
    throw error;
  }
}

export async function getSenders(): Promise<Sender[]> {
  const db = await getDatabase();
  const rows = await db.getAll(`
    SELECT id, domain, name, email_count, last_email_date, classification, tags
    FROM senders
    ORDER BY email_count DESC
  `);

  return rows.map(row => ({
    id: row.id,
    domain: row.domain,
    name: row.name,
    emailCount: row.email_count,
    lastEmailDate: row.last_email_date,
    classification: row.classification,
    tags: row.tags ? JSON.parse(row.tags) : []
  }));
}

export async function getEmailsBySender(domain: string): Promise<Email[]> {
  const db = await getDatabase();
  const rows = await db.getAll(`
    SELECT id, from, subject, body, date, headers, classification, tags
    FROM emails
    WHERE from LIKE ? AND date >= datetime('now', '-30 days')
    ORDER BY date DESC
  `, [`%@${domain}`]);

  return rows.map(row => ({
    id: row.id,
    from: row.from,
    subject: row.subject,
    body: row.body,
    date: row.date,
    headers: JSON.parse(row.headers),
    classification: row.classification,
    tags: row.tags ? JSON.parse(row.tags) : []
  }));
}

export async function markEmailAsUnsubscribed(emailId: string): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    UPDATE emails
    SET unsubscribed = 1
    WHERE id = ?
  `, [emailId]);
}

export async function addToUnsubscribeQueue(emailId: string, action: string): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    INSERT INTO unsubscribe_queue (email_id, action)
    VALUES (?, ?)
  `, [emailId, action]);
}

export async function getPendingUnsubscribeActions(): Promise<Array<{ id: number; emailId: string; action: string }>> {
  const db = await getDatabase();
  const rows = await db.getAll(`
    SELECT id, email_id, action
    FROM unsubscribe_queue
    WHERE status = 'pending'
  `);

  return rows.map(row => ({
    id: row.id,
    emailId: row.email_id,
    action: row.action
  }));
}

export async function updateUnsubscribeActionStatus(id: number, status: string): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    UPDATE unsubscribe_queue
    SET status = ?
    WHERE id = ?
  `, [status, id]);
}

export async function updateUserStats(unsubscribedCount: number, totalEmails: number): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    UPDATE user_stats
    SET streak = streak + 1,
        last_active_date = CURRENT_DATE,
        total_unsubscribed = total_unsubscribed + ?,
        total_emails = total_emails + ?
    WHERE id = 1
  `, [unsubscribedCount, totalEmails]);
}

export async function getUserStats(): Promise<{
  streak: number;
  lastActiveDate: string | null;
  totalUnsubscribed: number;
  totalEmails: number;
}> {
  const db = await getDatabase();
  const row = await db.getFirst(`
    SELECT streak, last_active_date, total_unsubscribed, total_emails
    FROM user_stats
    WHERE id = 1
  `);

  return {
    streak: row.streak,
    lastActiveDate: row.last_active_date,
    totalUnsubscribed: row.total_unsubscribed,
    totalEmails: row.total_emails
  };
}

export async function updateUserSettings(provider: string | null, lastScanDate: string | null): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    UPDATE user_settings
    SET email_provider = ?,
        last_scan_date = ?
    WHERE id = 1
  `, [provider, lastScanDate]);
}

export async function getUserSettings(): Promise<{
  emailProvider: string | null;
  lastScanDate: string | null;
  autoUnsubscribe: boolean;
  notificationEnabled: boolean;
}> {
  const db = await getDatabase();
  const row = await db.getFirst(`
    SELECT email_provider, last_scan_date, auto_unsubscribe, notification_enabled
    FROM user_settings
    WHERE id = 1
  `);

  return {
    emailProvider: row.email_provider,
    lastScanDate: row.last_scan_date,
    autoUnsubscribe: row.auto_unsubscribe === 1,
    notificationEnabled: row.notification_enabled === 1
  };
}
