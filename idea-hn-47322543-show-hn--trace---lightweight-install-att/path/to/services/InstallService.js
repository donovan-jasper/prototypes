import { SQLite } from 'expo-sqlite';
import Install from '../models/Install';

const db = SQLite.openDatabase('install.db');

const insertInstall = async () => {
  try {
    await db.transaction(tx => {
      tx.executeSql('INSERT INTO installs (source) VALUES (?)', ['unknown']);
    });
  } catch (error) {
    console.error(error);
  }
};

const getInstallCount = async () => {
  try {
    const result = await db.transaction(tx => {
      tx.executeSql('SELECT COUNT(*) as count FROM installs');
    });
    return result._array[0].count;
  } catch (error) {
    console.error(error);
  }
};

export { db, insertInstall, getInstallCount };
