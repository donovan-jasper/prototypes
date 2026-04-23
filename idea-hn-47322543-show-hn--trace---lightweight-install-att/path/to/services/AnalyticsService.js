import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('analytics.db');

// Initialize database tables if they don't exist
const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS installs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          install_date TEXT NOT NULL,
          source TEXT,
          platform TEXT
        );`,
        [],
        () => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS deep_links (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              url TEXT NOT NULL,
              created_at TEXT NOT NULL,
              clicks INTEGER DEFAULT 0
            );`,
            [],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Get total install count
const getInstallCount = async () => {
  try {
    await initializeDatabase();
    const result = await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM installs',
          [],
          (_, { rows }) => resolve(rows._array[0].count),
          (_, error) => reject(error)
        );
      });
    });
    return result;
  } catch (error) {
    console.error('Error getting install count:', error);
    return 0;
  }
};

// Get total deep link count
const getDeepLinkCount = async () => {
  try {
    await initializeDatabase();
    const result = await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM deep_links',
          [],
          (_, { rows }) => resolve(rows._array[0].count),
          (_, error) => reject(error)
        );
      });
    });
    return result;
  } catch (error) {
    console.error('Error getting deep link count:', error);
    return 0;
  }
};

// Get install trend data for today vs yesterday
const getInstallTrendData = async () => {
  try {
    await initializeDatabase();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const result = await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT
            SUM(CASE WHEN date(install_date) = ? THEN 1 ELSE 0 END) as today,
            SUM(CASE WHEN date(install_date) = ? THEN 1 ELSE 0 END) as yesterday
           FROM installs`,
          [today, yesterday],
          (_, { rows }) => resolve(rows._array[0]),
          (_, error) => reject(error)
        );
      });
    });

    return {
      today: result.today || 0,
      yesterday: result.yesterday || 0
    };
  } catch (error) {
    console.error('Error getting install trend data:', error);
    return { today: 0, yesterday: 0 };
  }
};

// Get top install sources
const getInstallsBySource = async () => {
  try {
    await initializeDatabase();
    const result = await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT source, COUNT(*) as count
           FROM installs
           WHERE source IS NOT NULL AND source != ''
           GROUP BY source
           ORDER BY count DESC
           LIMIT 5`,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });

    return result.map(item => ({
      source: item.source || 'Unknown',
      count: item.count
    }));
  } catch (error) {
    console.error('Error getting installs by source:', error);
    return [];
  }
};

export {
  db,
  initializeDatabase,
  getInstallCount,
  getDeepLinkCount,
  getInstallTrendData,
  getInstallsBySource
};
