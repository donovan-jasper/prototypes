import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('librio.db');

const fetchOfflineContent = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM offline_content',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => {
          console.log('Error fetching offline content:', error);
          resolve([]);
        }
      );
    });
  });
};

export { fetchOfflineContent };
