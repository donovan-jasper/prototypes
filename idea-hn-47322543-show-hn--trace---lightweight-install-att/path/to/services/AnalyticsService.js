import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('analytics.db');

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

const getDeepLinkCount = async () => {
  try {
    const result = await db.transaction(tx => {
      tx.executeSql('SELECT COUNT(*) as count FROM deep_links');
    });
    return result._array[0].count;
  } catch (error) {
    console.error(error);
  }
};

export { db, getInstallCount, getDeepLinkCount };
