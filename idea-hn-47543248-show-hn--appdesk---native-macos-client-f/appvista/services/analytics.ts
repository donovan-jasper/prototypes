import { openDatabase } from 'expo-sqlite';
import { getAppStoreData } from './api';

const db = openDatabase('appvista.db');

export const fetchAnalytics = async (appId: string) => {
  // Check cache first
  const cachedData = await getCachedAnalytics(appId);
  if (cachedData) {
    return cachedData;
  }

  // Fetch from API if not in cache
  const data = await getAppStoreData(appId);

  // Cache the data
  await cacheAnalytics(appId, data);

  return data;
};

const getCachedAnalytics = (appId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM analytics WHERE appId = ?',
        [appId],
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
};

const cacheAnalytics = (appId: string, data: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT OR REPLACE INTO analytics (appId, data) VALUES (?, ?)',
        [appId, JSON.stringify(data)],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
