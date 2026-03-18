import * as SQLite from 'expo-sqlite';

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const seedDatabase = async () => {
  const existing = await db.getAllAsync('SELECT COUNT(*) as count FROM subscriptions');
  
  if (existing[0].count === 0) {
    const seedData = [
      { name: 'Netflix', source: 'billing@netflix.com', category: 'email', cost: 15.99, unsubscribe_url: 'https://www.netflix.com/cancelplan' },
      { name: 'NY Times Newsletter', source: 'newsletters@nytimes.com', category: 'newsletter', cost: 0, unsubscribe_url: 'https://myaccount.nytimes.com/seg/settings' },
      { name: 'Spotify', source: 'no-reply@spotify.com', category: 'email', cost: 9.99, unsubscribe_url: 'https://www.spotify.com/account/subscription/' },
      { name: 'LinkedIn Updates', source: 'notifications@linkedin.com', category: 'social', cost: 0, unsubscribe_url: 'https://www.linkedin.com/psettings/email-frequency' },
      { name: 'Medium Digest', source: 'digest@medium.com', category: 'newsletter', cost: 5.00, unsubscribe_url: 'https://medium.com/me/settings' },
    ];

    for (const sub of seedData) {
      await db.runAsync(
        'INSERT INTO subscriptions (name, source, category, cost, unsubscribe_url, status) VALUES (?, ?, ?, ?, ?, ?)',
        [sub.name, sub.source, sub.category, sub.cost, sub.unsubscribe_url, 'active']
      );
    }
  }
};

const getSubscriptions = async () => {
  const subscriptions = await db.getAllAsync('SELECT * FROM subscriptions WHERE status = ? ORDER BY created_at DESC', ['active']);
  return subscriptions;
};

const addSubscription = async (subscription) => {
  await db.runAsync(
    'INSERT INTO subscriptions (name, source, category, cost, unsubscribe_url, status) VALUES (?, ?, ?, ?, ?, ?)',
    [subscription.name, subscription.source, subscription.category, subscription.cost, subscription.unsubscribe_url || null, 'active']
  );
};

const markAsUnsubscribed = async (id) => {
  await db.runAsync('UPDATE subscriptions SET status = ? WHERE id = ?', ['unsubscribed', id]);
};

const unsubscribe = async (id) => {
  await db.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
};

export { initDatabase, seedDatabase, getSubscriptions, addSubscription, markAsUnsubscribed, unsubscribe };
