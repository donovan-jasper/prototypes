import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('discordx.db');

const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS channels (id TEXT PRIMARY KEY, server_id TEXT, name TEXT, type INTEGER, last_updated TEXT);',
      []
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS channel_sync (server_id TEXT PRIMARY KEY, last_sync_time TEXT);',
      []
    );
  });
};

const saveChannels = (serverId, channels) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Clear existing channels for this server
        tx.executeSql('DELETE FROM channels WHERE server_id = ?;', [serverId]);

        // Insert new channels
        channels.forEach(channel => {
          tx.executeSql(
            'INSERT INTO channels (id, server_id, name, type, last_updated) VALUES (?, ?, ?, ?, ?);',
            [channel.id, serverId, channel.name, channel.type, new Date().toISOString()]
          );
        });

        // Update last sync time
        tx.executeSql(
          'INSERT OR REPLACE INTO channel_sync (server_id, last_sync_time) VALUES (?, ?);',
          [serverId, new Date().toISOString()]
        );
      },
      error => {
        console.error('Error saving channels:', error);
        reject(error);
      },
      () => {
        resolve();
      }
    );
  });
};

const getChannels = (serverId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM channels WHERE server_id = ? ORDER BY name ASC;',
          [serverId],
          (_, { rows }) => {
            resolve(rows._array);
          }
        );
      },
      error => {
        console.error('Error getting channels:', error);
        reject(error);
      }
    );
  });
};

const getLastSyncTime = (serverId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT last_sync_time FROM channel_sync WHERE server_id = ?;',
          [serverId],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(new Date(rows.item(0).last_sync_time));
            } else {
              resolve(null);
            }
          }
        );
      },
      error => {
        console.error('Error getting last sync time:', error);
        reject(error);
      }
    );
  });
};

export { initializeDatabase, saveChannels, getChannels, getLastSyncTime };
