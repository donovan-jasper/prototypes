import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('analytics.db');

const getInstallCount = async () => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT COUNT(*) as count FROM installs', [], (_, { rows }) => {
          resolve(rows._array[0].count);
        }, (_, error) => {
          reject(error);
        });
      });
    });
    return result;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

const getDeepLinkCount = async () => {
  try {
    const result = await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT COUNT(*) as count FROM deep_links', [], (_, { rows }) => {
          resolve(rows._array[0].count);
        }, (_, error) => {
          reject(error);
        });
      });
    });
    return result;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

const getInstallTrendData = async () => {
  try {
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
          (_, { rows }) => {
            resolve(rows._array[0]);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });

    return {
      today: result.today || 0,
      yesterday: result.yesterday || 0
    };
  } catch (error) {
    console.error(error);
    return { today: 0, yesterday: 0 };
  }
};

const getInstallsBySource = async () => {
  try {
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
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            reject(error);
          }
        );
      });
    });

    return result.map(item => ({
      source: item.source || 'Unknown',
      count: item.count
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export { db, getInstallCount, getDeepLinkCount, getInstallTrendData, getInstallsBySource };
