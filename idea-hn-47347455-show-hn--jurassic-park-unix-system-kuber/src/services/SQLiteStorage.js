import { SQLite } from 'expo-sqlite';

const SQLiteStorage = () => {
  const db = SQLite.openDatabase('retropulse.db');

  const getSystemMetrics = async () => {
    const query = 'SELECT * FROM system_metrics';
    const results = await db.transaction((tx) => {
      tx.executeSql(query, [], (_, { rows }) => {
        return rows._array;
      });
    });
    return results;
  };

  return { getSystemMetrics };
};

export default SQLiteStorage;
