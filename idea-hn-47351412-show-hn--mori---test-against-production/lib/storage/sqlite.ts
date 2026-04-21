import { SQLite } from 'expo-sqlite';

const saveSnapshot = async (filePath: string, connection: any, options: any) => {
  const db = await SQLite.openDatabase('datamirror.db');
  await db.transaction((tx) => {
    tx.executeSql('INSERT INTO snapshots (file_path, connection, options) VALUES (?, ?, ?)', [filePath, JSON.stringify(connection), JSON.stringify(options)]);
  });
  await db.close();
};

export { saveSnapshot };
