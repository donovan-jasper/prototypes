import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('strikezone.db');

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS performances (id INTEGER PRIMARY KEY AUTOINCREMENT, challenge_id TEXT, score INTEGER, accuracy REAL, time_ms INTEGER, timestamp INTEGER);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS routines (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, challenges TEXT);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS user_stats (id INTEGER PRIMARY KEY AUTOINCREMENT, streak INTEGER, total_challenges INTEGER, best_scores TEXT);'
    );
  });
};

export const savePerformance = (record) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO performances (challenge_id, score, accuracy, time_ms, timestamp) VALUES (?, ?, ?, ?, ?);',
        [record.challengeId, record.score, record.accuracy, record.timeMs, record.timestamp],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getRecentScores = (challengeId, days) => {
  return new Promise((resolve, reject) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM performances WHERE challenge_id = ? AND timestamp >= ? ORDER BY timestamp DESC;',
        [challengeId, cutoff.getTime()],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getStreakCount = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT streak FROM user_stats LIMIT 1;',
        [],
        (_, { rows: { _array } }) => resolve(_array.length > 0 ? _array[0].streak : 0),
        (_, error) => reject(error)
      );
    });
  });
};
