import * as SQLite from 'expo-sqlite';
import { Email, Sender, UnsubscribeAction } from '../types';

const db = SQLite.openDatabase('inboxzen.db');

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create emails table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS emails (
          id TEXT PRIMARY KEY,
          from_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          body TEXT NOT NULL,
          date TEXT NOT NULL,
          headers TEXT NOT NULL,
          classification TEXT NOT NULL,
          tags TEXT NOT NULL,
          processed INTEGER DEFAULT 0,
          unsubscribed INTEGER DEFAULT 0
        );`,
        [],
        () => {
          // Create senders table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS senders (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              domain TEXT UNIQUE NOT NULL,
              name TEXT NOT NULL,
              email_count INTEGER DEFAULT 0,
              last_email_date TEXT,
              classification TEXT,
              tags TEXT
            );`,
            [],
            () => {
              // Create unsubscribe queue table
              tx.executeSql(
                `CREATE TABLE IF NOT EXISTS unsubscribe_queue (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  email_id TEXT NOT NULL,
                  domain TEXT NOT NULL,
                  action_type TEXT NOT NULL,
                  status TEXT NOT NULL,
                  created_at TEXT NOT NULL,
                  FOREIGN KEY (email_id) REFERENCES emails (id)
                );`,
                [],
                () => {
                  // Create user settings table
                  tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS user_settings (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      email_provider TEXT NOT NULL,
                      last_scan_date TEXT,
                      unsubscribes_count INTEGER DEFAULT 0,
                      premium_subscription INTEGER DEFAULT 0,
                      notification_enabled INTEGER DEFAULT 1
                    );`,
                    [],
                    () => resolve(),
                    (_, error) => reject(error)
                  );
                },
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
}

export async function saveEmails(emails: Email[]): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      emails.forEach(email => {
        tx.executeSql(
          `INSERT OR REPLACE INTO emails (
            id, from_email, subject, body, date, headers, classification, tags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            email.id,
            email.from,
            email.subject,
            email.body,
            email.date,
            JSON.stringify(email.headers),
            email.classification,
            JSON.stringify(email.tags)
          ],
          () => {
            // Update sender stats
            const domain = email.from.split('@')[1] || 'unknown';
            tx.executeSql(
              `INSERT OR REPLACE INTO senders (
                domain, name, email_count, last_email_date, classification, tags
              ) VALUES (
                ?, ?, COALESCE((SELECT email_count FROM senders WHERE domain = ?), 0) + 1,
                ?, ?, ?
              );`,
              [
                domain,
                domain,
                domain,
                email.date,
                email.classification,
                JSON.stringify(email.tags)
              ],
              () => {},
              (_, error) => console.error('Error updating sender:', error)
            );
          },
          (_, error) => console.error('Error saving email:', error)
        );
      });
    }, reject, resolve);
  });
}

export async function getSenders(): Promise<Sender[]> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM senders ORDER BY email_count DESC;`,
        [],
        (_, { rows }) => {
          const senders: Sender[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            senders.push({
              id: row.id,
              domain: row.domain,
              name: row.name,
              emailCount: row.email_count,
              lastEmailDate: row.last_email_date,
              classification: row.classification,
              tags: JSON.parse(row.tags || '[]')
            });
          }
          resolve(senders);
        },
        (_, error) => reject(error)
      );
    });
  });
}

export async function getEmailsBySender(domain: string): Promise<Email[]> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM emails WHERE from_email LIKE ? ORDER BY date DESC;`,
        [`%@${domain}`],
        (_, { rows }) => {
          const emails: Email[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            emails.push({
              id: row.id,
              from: row.from_email,
              subject: row.subject,
              body: row.body,
              date: row.date,
              headers: JSON.parse(row.headers),
              classification: row.classification,
              tags: JSON.parse(row.tags || '[]'),
              processed: row.processed === 1,
              unsubscribed: row.unsubscribed === 1
            });
          }
          resolve(emails);
        },
        (_, error) => reject(error)
      );
    });
  });
}

export async function markEmailAsUnsubscribed(emailId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE emails SET unsubscribed = 1 WHERE id = ?;`,
        [emailId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
}

export async function addToUnsubscribeQueue(emailId: string, domain: string, actionType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO unsubscribe_queue (
          email_id, domain, action_type, status, created_at
        ) VALUES (?, ?, ?, 'pending', datetime('now'));`,
        [emailId, domain, actionType],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
}

export async function getUnsubscribeQueue(): Promise<UnsubscribeAction[]> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM unsubscribe_queue WHERE status = 'pending' ORDER BY created_at ASC;`,
        [],
        (_, { rows }) => {
          const actions: UnsubscribeAction[] = [];
          for (let i = 0; i < rows.length; i++) {
            const row = rows.item(i);
            actions.push({
              id: row.id,
              emailId: row.email_id,
              domain: row.domain,
              actionType: row.action_type,
              status: row.status,
              createdAt: row.created_at
            });
          }
          resolve(actions);
        },
        (_, error) => reject(error)
      );
    });
  });
}

export async function updateUnsubscribeStatus(actionId: number, status: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE unsubscribe_queue SET status = ? WHERE id = ?;`,
        [status, actionId],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
}

export async function getUserSettings(): Promise<any> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM user_settings LIMIT 1;`,
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
}

export async function saveUserSettings(settings: any): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO user_settings (
          id, email_provider, last_scan_date, unsubscribes_count, premium_subscription, notification_enabled
        ) VALUES (
          COALESCE((SELECT id FROM user_settings LIMIT 1), 1),
          ?, ?, ?, ?, ?
        );`,
        [
          settings.emailProvider,
          settings.lastScanDate,
          settings.unsubscribesCount,
          settings.premiumSubscription ? 1 : 0,
          settings.notificationEnabled ? 1 : 0
        ],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
}

export async function incrementUnsubscribeCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE user_settings SET unsubscribes_count = unsubscribes_count + 1 RETURNING unsubscribes_count;`,
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0).unsubscribes_count);
          } else {
            resolve(0);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
}
