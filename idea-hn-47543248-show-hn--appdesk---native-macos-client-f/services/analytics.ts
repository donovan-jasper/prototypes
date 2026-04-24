import * as SQLite from 'expo-sqlite';
import { getAppStoreData } from './api';

const db = SQLite.openDatabase('appvista.db');

export interface AnalyticsData {
  date: string;
  sales: number;
  downloads: number;
  ratings: number;
  reviews: number;
}

export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS analytics (id INTEGER PRIMARY KEY AUTOINCREMENT, appId TEXT, date TEXT, sales INTEGER, downloads INTEGER, ratings REAL, reviews INTEGER);',
        [],
        () => resolve(true),
        (_, error) => reject(error)
      );
    });
  });
};

export const fetchAnalytics = async (appId: string): Promise<AnalyticsData[]> => {
  try {
    // First try to get fresh data from API
    const freshData = await getAppStoreData(appId);

    // Transform API response to AnalyticsData format
    const transformedData: AnalyticsData[] = freshData.map((item: any) => ({
      date: item.date,
      sales: item.sales,
      downloads: item.downloads,
      ratings: parseFloat(item.ratings),
      reviews: item.reviews
    }));

    // Store fresh data in SQLite
    await storeAnalytics(appId, transformedData);

    return transformedData;
  } catch (error) {
    console.log('Failed to fetch fresh data, falling back to cache:', error);
    // If API fails, get cached data
    return getCachedAnalytics(appId);
  }
};

const storeAnalytics = async (appId: string, data: AnalyticsData[]) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Clear old data for this app
      tx.executeSql('DELETE FROM analytics WHERE appId = ?', [appId]);

      // Insert new data
      data.forEach(item => {
        tx.executeSql(
          'INSERT INTO analytics (appId, date, sales, downloads, ratings, reviews) VALUES (?, ?, ?, ?, ?, ?)',
          [appId, item.date, item.sales, item.downloads, item.ratings, item.reviews]
        );
      });

      resolve(true);
    }, error => reject(error));
  });
};

const getCachedAnalytics = async (appId: string): Promise<AnalyticsData[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM analytics WHERE appId = ? ORDER BY date DESC LIMIT 30',
        [appId],
        (_, { rows }) => {
          const data: AnalyticsData[] = [];
          for (let i = 0; i < rows.length; i++) {
            data.push(rows.item(i));
          }
          resolve(data.reverse()); // Return in chronological order
        },
        (_, error) => reject(error)
      );
    });
  });
};
