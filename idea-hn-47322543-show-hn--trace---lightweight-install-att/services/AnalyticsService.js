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

export { getInstallCount, getDeepLinkCount };
