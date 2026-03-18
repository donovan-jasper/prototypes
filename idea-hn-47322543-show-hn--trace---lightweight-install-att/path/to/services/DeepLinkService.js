import { SQLite } from 'expo-sqlite';
import DeepLink from '../models/DeepLink';

const db = SQLite.openDatabase('deep_link.db');

const insertDeepLink = async () => {
  try {
    await db.transaction(tx => {
      tx.executeSql('INSERT INTO deep_links (url) VALUES (?)', ['https://example.com']);
    });
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

export { db, insertDeepLink, getDeepLinkCount };
