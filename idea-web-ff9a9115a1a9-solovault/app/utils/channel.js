import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('brainvault.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS channels (id TEXT PRIMARY KEY, name TEXT, createdAt INTEGER);',
      [],
      () => {
        // Check if default channels exist
        tx.executeSql(
          'SELECT COUNT(*) as count FROM channels;',
          [],
          (_, { rows }) => {
            if (rows.item(0).count === 0) {
              // Create default channels
              const defaultChannels = ['Work', 'Personal', 'Ideas'];
              defaultChannels.forEach(channelName => {
                const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                tx.executeSql(
                  'INSERT INTO channels (id, name, createdAt) VALUES (?, ?, ?);',
                  [id, channelName, Date.now()]
                );
              });
            }
          }
        );
      }
    );
  });
};

export const getChannels = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM channels ORDER BY createdAt DESC;',
        [],
        (_, { rows }) => {
          const channels = [];
          for (let i = 0; i < rows.length; i++) {
            channels.push(rows.item(i));
          }
          resolve(channels);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const createChannel = (name) => {
  return new Promise((resolve, reject) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO channels (id, name, createdAt) VALUES (?, ?, ?);',
        [id, name, Date.now()],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getItemsCount = (channelId) => {
  // This would be implemented when we have the items table
  // For now, we'll return a random count for demonstration
  return Promise.resolve(Math.floor(Math.random() * 20));
};
