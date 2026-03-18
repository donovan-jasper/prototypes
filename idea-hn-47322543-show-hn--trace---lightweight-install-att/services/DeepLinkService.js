import { db } from './DatabaseService';

const insertDeepLink = (url = 'https://example.com') => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT INTO deep_links (url, created_at, clicks) VALUES (?, ?, ?)',
          [url, Date.now(), 0],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            console.error('Error inserting deep link:', error);
            return false;
          }
        );
      },
      error => {
        reject(error);
      },
      () => {
        resolve();
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
            return false;
          }
        );
      },
      error => {
        reject(error);
      }
    );
  });
};

export { insertDeepLink, getDeepLinkCount };
