import { openDatabase } from 'expo-sqlite';
import { getAppStoreReviews } from './api';

const db = openDatabase('appvista.db');

export const fetchReviews = async (appId: string) => {
  // Check cache first
  const cachedReviews = await getCachedReviews(appId);
  if (cachedReviews) {
    return cachedReviews;
  }

  // Fetch from API if not in cache
  const reviews = await getAppStoreReviews(appId);

  // Cache the reviews
  await cacheReviews(appId, reviews);

  return reviews;
};

const getCachedReviews = (appId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM reviews WHERE appId = ?',
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

const cacheReviews = (appId: string, reviews: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT OR REPLACE INTO reviews (appId, reviews) VALUES (?, ?)',
        [appId, JSON.stringify(reviews)],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
