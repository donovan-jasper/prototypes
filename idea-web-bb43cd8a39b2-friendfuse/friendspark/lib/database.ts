import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('friendspark.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        friend_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (friend_id) REFERENCES friends (id)
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        friend_id INTEGER,
        challenge_type TEXT NOT NULL,
        completed_at DATETIME,
        status TEXT NOT NULL,
        FOREIGN KEY (friend_id) REFERENCES friends (id)
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL
      );`
    );
  });
};

export const getFriends = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM friends ORDER BY name;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const addFriend = (friend) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO friends (name, phone, email, avatar) VALUES (?, ?, ?, ?);',
        [friend.name, friend.phone, friend.email, friend.avatar],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getInteractions = (friendId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM interactions WHERE friend_id = ? ORDER BY timestamp DESC;',
        [friendId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const addInteraction = (interaction) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO interactions (friend_id, type, notes) VALUES (?, ?, ?);',
        [interaction.friend_id, interaction.type, interaction.notes],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getChallenges = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM challenges;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const addChallenge = (challenge) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO challenges (friend_id, challenge_type, status) VALUES (?, ?, ?);',
        [challenge.friend_id, challenge.challenge_type, challenge.status],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSettings = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM settings;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const setSetting = (key, value) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
        [key, value],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
