import { db } from './DatabaseService';

const getInstallCount = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM installs',
          [],
          (_, result) => {
            resolve(result.rows._array[0].count);
          },
          (_, error) => {
            console.error('Error getting install count:', error);
            reject(error);
          }
        );
      },
      error => {
        reject(error);
      }
    );
  });
};

const getDeepLinkCount = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT COUNT(*) as count FROM deep_links',
          [],
          (_, result) => {
            resolve(result.rows._array[0].count);
          },
          (_, error) => {
            console.error('Error getting deep link count:', error);
            reject(error);
          }
        );
      },
      error => {
        reject(error);
      }
    );
  });
};

const getInstallsBySource = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT source, COUNT(*) as count FROM installs GROUP BY source ORDER BY count DESC',
          [],
          (_, result) => {
            resolve(result.rows._array);
          },
          (_, error) => {
            console.error('Error getting installs by source:', error);
            reject(error);
          }
        );
      },
      error => {
        reject(error);
      }
    );
  });
};

const getRecentInstalls = (limit = 20) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT source, timestamp FROM installs ORDER BY timestamp DESC LIMIT ?',
          [limit],
          (_, result) => {
            resolve(result.rows._array);
          },
          (_, error) => {
            console.error('Error getting recent installs:', error);
            reject(error);
          }
        );
      },
      error => {
        reject(error);
      }
    );
  });
};

const getInstallTrendData = async () => {
  try {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

    const recentInstalls = await getRecentInstalls(50);

    const todayCount = recentInstalls.filter(install =>
      install.timestamp >= oneDayAgo
    ).length;

    const yesterdayCount = recentInstalls.filter(install =>
      install.timestamp >= twoDaysAgo && install.timestamp < oneDayAgo
    ).length;

    return { today: todayCount, yesterday: yesterdayCount };
  } catch (error) {
    console.error('Error getting install trend data:', error);
    throw error;
  }
};

export {
  getInstallCount,
  getDeepLinkCount,
  getInstallsBySource,
  getRecentInstalls,
  getInstallTrendData
};
