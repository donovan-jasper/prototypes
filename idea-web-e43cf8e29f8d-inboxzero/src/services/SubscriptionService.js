import * as SQLite from 'expo-sqlite';
import { scheduleRenewalNotification, cancelRenewalNotification } from './NotificationService';

let db;

const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('subsync.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      source TEXT,
      category TEXT,
      cost REAL DEFAULT 0,
      unsubscribe_url TEXT,
      status TEXT DEFAULT 'active',
      billing_cycle TEXT,
      renewal_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const existing = await db.getAllAsync('SELECT * FROM settings WHERE key = ?', ['renewal_reminders']);
  if (existing.length === 0) {
    await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', ['renewal_reminders', 'true']);
  }
};

const seedDatabase = async () => {
  const existing = await db.getAllAsync('SELECT COUNT(*) as count FROM subscriptions');

  if (existing[0].count === 0) {
    const seedData = [
      {
        name: 'Netflix',
        source: 'billing@netflix.com',
        category: 'email',
        cost: 15.99,
        unsubscribe_url: 'https://www.netflix.com/cancelplan',
        billing_cycle: 'monthly',
        renewal_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'NY Times Newsletter',
        source: 'newsletters@nytimes.com',
        category: 'newsletter',
        cost: 0,
        unsubscribe_url: 'https://myaccount.nytimes.com/seg/settings',
        billing_cycle: null,
        renewal_date: null
      },
      {
        name: 'Spotify',
        source: 'no-reply@spotify.com',
        category: 'email',
        cost: 9.99,
        unsubscribe_url: 'https://www.spotify.com/account/subscription/',
        billing_cycle: 'monthly',
        renewal_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'LinkedIn Updates',
        source: 'notifications@linkedin.com',
        category: 'social',
        cost: 0,
        unsubscribe_url: 'https://www.linkedin.com/psettings/email-frequency',
        billing_cycle: null,
        renewal_date: null
      },
      {
        name: 'Medium Digest',
        source: 'digest@medium.com',
        category: 'newsletter',
        cost: 5.00,
        unsubscribe_url: 'https://medium.com/me/settings',
        billing_cycle: 'monthly',
        renewal_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
    ];

    for (const sub of seedData) {
      await db.runAsync(
        'INSERT INTO subscriptions (name, source, category, cost, unsubscribe_url, status, billing_cycle, renewal_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [sub.name, sub.source, sub.category, sub.cost, sub.unsubscribe_url, 'active', sub.billing_cycle, sub.renewal_date]
      );
    }
  }
};

const getSubscriptions = async () => {
  const subscriptions = await db.getAllAsync('SELECT * FROM subscriptions WHERE status = ? ORDER BY created_at DESC', ['active']);
  return subscriptions;
};

const addSubscription = async (subscription) => {
  const result = await db.runAsync(
    'INSERT INTO subscriptions (name, source, category, cost, unsubscribe_url, status, billing_cycle, renewal_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      subscription.name,
      subscription.source,
      subscription.category,
      subscription.cost,
      subscription.unsubscribe_url || null,
      'active',
      subscription.billing_cycle || null,
      subscription.renewal_date || null
    ]
  );

  const remindersEnabled = await getSetting('renewal_reminders');
  if (remindersEnabled === 'true' && subscription.renewal_date) {
    await scheduleRenewalNotification({
      id: result.lastInsertRowId,
      ...subscription
    });
  }

  return result.lastInsertRowId;
};

const updateSubscription = async (id, subscription) => {
  await db.runAsync(
    'UPDATE subscriptions SET name = ?, source = ?, category = ?, cost = ?, unsubscribe_url = ?, billing_cycle = ?, renewal_date = ? WHERE id = ?',
    [
      subscription.name,
      subscription.source,
      subscription.category,
      subscription.cost,
      subscription.unsubscribe_url || null,
      subscription.billing_cycle || null,
      subscription.renewal_date || null,
      id
    ]
  );

  await cancelRenewalNotification(id);

  const remindersEnabled = await getSetting('renewal_reminders');
  if (remindersEnabled === 'true' && subscription.renewal_date) {
    await scheduleRenewalNotification({
      id,
      ...subscription
    });
  }
};

const markAsUnsubscribed = async (id) => {
  await db.runAsync('UPDATE subscriptions SET status = ? WHERE id = ?', ['unsubscribed', id]);
  await cancelRenewalNotification(id);
};

const unsubscribe = async (id) => {
  await db.runAsync('UPDATE subscriptions SET status = ? WHERE id = ?', ['unsubscribed', id]);
  await cancelRenewalNotification(id);
};

const getTotalMonthlyCost = async () => {
  const result = await db.getAllAsync(`
    SELECT SUM(cost) as total
    FROM subscriptions
    WHERE status = 'active'
    AND (billing_cycle = 'monthly' OR billing_cycle IS NULL)
  `);
  return result[0].total || 0;
};

const getUpcomingRenewals = async () => {
  const now = new Date().toISOString();
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const subscriptions = await db.getAllAsync(`
    SELECT *
    FROM subscriptions
    WHERE status = 'active'
    AND renewal_date BETWEEN ? AND ?
    ORDER BY renewal_date ASC
  `, [now, futureDate]);

  return subscriptions;
};

const getSetting = async (key) => {
  const result = await db.getAllAsync('SELECT value FROM settings WHERE key = ?', [key]);
  return result.length > 0 ? result[0].value : null;
};

const setSetting = async (key, value) => {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
};

const SubscriptionService = {
  initDatabase,
  seedDatabase,
  getSubscriptions,
  addSubscription,
  updateSubscription,
  markAsUnsubscribed,
  unsubscribe,
  getTotalMonthlyCost,
  getUpcomingRenewals,
  getSetting,
  setSetting
};

export default SubscriptionService;
