import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({
  name: 'librio.db',
  location: 'default',
});

const fetchOfflineContent = async () => {
  const query = 'SELECT * FROM offline_content';
  const results = await db.transaction(tx => tx.executeSql(query));
  return results._array;
};

export { fetchOfflineContent };
