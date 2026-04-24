import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('skillhive.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS challenges (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, xpReward INTEGER, completed BOOLEAN);'
    );
  });
};

export const addChallenge = (title: string, description: string, xpReward: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO challenges (title, description, xpReward, completed) VALUES (?, ?, ?, ?);',
      [title, description, xpReward, false]
    );
  });
};

export const getChallenges = (callback: (challenges: any[]) => void) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM challenges;',
      [],
      (_, { rows }) => callback(rows._array)
    );
  });
};

export const completeChallenge = (id: number) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE challenges SET completed = ? WHERE id = ?;',
      [true, id]
    );
  });
};
