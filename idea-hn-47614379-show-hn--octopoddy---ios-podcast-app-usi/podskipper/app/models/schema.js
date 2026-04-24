import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('podskipper.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS episodes (' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'title TEXT NOT NULL, ' +
      'audioUrl TEXT NOT NULL, ' +
      'transcript TEXT, ' +
      'duration INTEGER, ' +
      'downloaded BOOLEAN DEFAULT 0' +
      ');'
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS ad_segments (' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'episode_id INTEGER NOT NULL, ' +
      'start INTEGER NOT NULL, ' +
      'end INTEGER NOT NULL, ' +
      'confidence REAL DEFAULT 0.5, ' +
      'FOREIGN KEY(episode_id) REFERENCES episodes(id) ON DELETE CASCADE' +
      ');'
    );

    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS playback_history (' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'episode_id INTEGER NOT NULL, ' +
      'timestamp INTEGER NOT NULL, ' +
      'position INTEGER NOT NULL, ' +
      'FOREIGN KEY(episode_id) REFERENCES episodes(id) ON DELETE CASCADE' +
      ');'
    );
  });
};

export const clearDatabase = () => {
  db.transaction(tx => {
    tx.executeSql('DROP TABLE IF EXISTS ad_segments');
    tx.executeSql('DROP TABLE IF EXISTS episodes');
    tx.executeSql('DROP TABLE IF EXISTS playback_history');
  });
};
