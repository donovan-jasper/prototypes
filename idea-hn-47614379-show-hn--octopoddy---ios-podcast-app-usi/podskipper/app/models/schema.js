import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('podskipper.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS episodes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, audioUrl TEXT, transcript TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS ad_segments (id INTEGER PRIMARY KEY AUTOINCREMENT, episode_id INTEGER, start INTEGER, end INTEGER, FOREIGN KEY(episode_id) REFERENCES episodes(id));'
    );
  });
};
