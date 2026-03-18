import { db } from './DatabaseService';

const insertInstall = (source = 'unknown') => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT INTO installs (source, timestamp) VALUES (?, ?)',
          [source, Date.now()],
          (_, result) => {
            resolve(result);
          },
          (_, error) => {
            console.error('Error inserting install:', error);
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

export { insertInstall, getInstallCount };
