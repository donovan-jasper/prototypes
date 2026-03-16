import * as SQLite from 'expo-sqlite';

export const openDatabase = () => {
  const db = SQLite.openDatabase('marketpulse.db');
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS watchlist (symbol TEXT PRIMARY KEY, price REAL, change REAL);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS user_preferences (key TEXT PRIMARY KEY, value TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS cached_prices (symbol TEXT PRIMARY KEY, price REAL, timestamp TEXT);'
    );
  });
  return db;
};
