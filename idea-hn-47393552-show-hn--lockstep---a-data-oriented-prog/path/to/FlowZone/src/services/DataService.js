import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('data.db');

const DataService = {
  createData: async (data) => {
    const query = 'INSERT INTO data (name, value) VALUES (?, ?)';
    const params = [data.name, data.value];
    await db.transaction((tx) => {
      tx.executeSql(query, params);
    });
  },
  getData: async () => {
    const query = 'SELECT * FROM data';
    const results = await db.transaction((tx) => {
      tx.executeSql(query, [], (_, { rows }) => {
        return rows._array;
      });
    });
    return results;
  },
};

export default DataService;
