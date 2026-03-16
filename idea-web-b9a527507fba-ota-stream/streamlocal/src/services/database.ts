import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('streamlocal.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT,
        logo TEXT,
        currentProgram TEXT,
        nextProgram TEXT,
        streamUrl TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        channelId TEXT,
        FOREIGN KEY (channelId) REFERENCES channels (id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        program TEXT,
        time TEXT,
        weather INTEGER,
        breakingNews INTEGER
      );`
    );
  });
};

export const insertChannels = (channels: any[]) => {
  db.transaction(tx => {
    channels.forEach(channel => {
      tx.executeSql(
        'INSERT OR REPLACE INTO channels (id, name, logo, currentProgram, nextProgram, streamUrl) VALUES (?, ?, ?, ?, ?, ?);',
        [channel.id, channel.name, channel.logo, channel.currentProgram, channel.nextProgram, channel.streamUrl]
      );
    });
  });
};

export const getChannels = (callback: (channels: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM channels;',
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => console.error('Error fetching channels:', error)
    );
  });
};

export const addFavorite = (channelId: string) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO favorites (channelId) VALUES (?);',
      [channelId],
      (_, result) => console.log('Favorite added:', result),
      (_, error) => console.error('Error adding favorite:', error)
    );
  });
};

export const removeFavorite = (channelId: string) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM favorites WHERE channelId = ?;',
      [channelId],
      (_, result) => console.log('Favorite removed:', result),
      (_, error) => console.error('Error removing favorite:', error)
    );
  });
};

export const getFavorites = (callback: (favorites: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM favorites;',
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => console.error('Error fetching favorites:', error)
    );
  });
};

export const addAlert = (alert: { program: string; time: string; weather: boolean; breakingNews: boolean }) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO alerts (program, time, weather, breakingNews) VALUES (?, ?, ?, ?);',
      [alert.program, alert.time, alert.weather ? 1 : 0, alert.breakingNews ? 1 : 0],
      (_, result) => console.log('Alert added:', result),
      (_, error) => console.error('Error adding alert:', error)
    );
  });
};

export const removeAlert = (id: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM alerts WHERE id = ?;',
      [id],
      (_, result) => console.log('Alert removed:', result),
      (_, error) => console.error('Error removing alert:', error)
    );
  });
};

export const getAlerts = (callback: (alerts: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM alerts;',
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => console.error('Error fetching alerts:', error)
    );
  });
};
