import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { getStoredToken, refreshToken } from './auth';

const db = SQLite.openDatabase('discordx.db');

const BASE_URL = 'https://discord.com/api/v9';

const initializeDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS servers (id TEXT PRIMARY KEY, name TEXT, icon TEXT);',
      []
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS channels (id TEXT PRIMARY KEY, server_id TEXT, name TEXT, type INTEGER);',
      []
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, channel_id TEXT, content TEXT, author TEXT, timestamp TEXT);',
      []
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS offline_status (key TEXT PRIMARY KEY, value TEXT);',
      []
    );
  });
};

const fetchWithAuth = async (endpoint, token, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (response.status === 401) {
      // Token expired, refresh and retry
      const newToken = await refreshToken();
      return fetchWithAuth(endpoint, newToken, method, body);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

const syncServers = async () => {
  const token = await getStoredToken();
  if (!token) throw new Error('No authentication token');

  try {
    const servers = await fetchWithAuth('/users/@me/guilds', token);

    db.transaction(tx => {
      // Clear existing servers
      tx.executeSql('DELETE FROM servers;');

      servers.forEach(server => {
        tx.executeSql(
          'INSERT INTO servers (id, name, icon) VALUES (?, ?, ?);',
          [server.id, server.name, server.icon]
        );
      });

      // Update last sync time
      tx.executeSql(
        'INSERT OR REPLACE INTO offline_status (key, value) VALUES (?, ?);',
        ['last_server_sync', new Date().toISOString()]
      );
    });

    return servers;
  } catch (error) {
    console.error('Failed to sync servers:', error);
    throw error;
  }
};

const syncChannels = async (serverId) => {
  const token = await getStoredToken();
  if (!token) throw new Error('No authentication token');

  try {
    const channels = await fetchWithAuth(`/guilds/${serverId}/channels`, token);

    db.transaction(tx => {
      // Clear existing channels for this server
      tx.executeSql('DELETE FROM channels WHERE server_id = ?;', [serverId]);

      channels.forEach(channel => {
        tx.executeSql(
          'INSERT INTO channels (id, server_id, name, type) VALUES (?, ?, ?, ?);',
          [channel.id, serverId, channel.name, channel.type]
        );
      });

      // Update last sync time
      tx.executeSql(
        'INSERT OR REPLACE INTO offline_status (key, value) VALUES (?, ?);',
        ['last_channel_sync', new Date().toISOString()]
      );
    });

    return channels;
  } catch (error) {
    console.error('Failed to sync channels:', error);
    throw error;
  }
};

const syncMessages = async (channelId) => {
  const token = await getStoredToken();
  if (!token) throw new Error('No authentication token');

  try {
    const messages = await fetchWithAuth(`/channels/${channelId}/messages`, token);

    db.transaction(tx => {
      // Clear existing messages for this channel
      tx.executeSql('DELETE FROM messages WHERE channel_id = ?;', [channelId]);

      messages.forEach(message => {
        tx.executeSql(
          'INSERT INTO messages (id, channel_id, content, author, timestamp) VALUES (?, ?, ?, ?, ?);',
          [message.id, channelId, message.content, message.author.username, message.timestamp]
        );
      });

      // Update last sync time
      tx.executeSql(
        'INSERT OR REPLACE INTO offline_status (key, value) VALUES (?, ?);',
        ['last_message_sync', new Date().toISOString()]
      );
    });

    return messages;
  } catch (error) {
    console.error('Failed to sync messages:', error);
    throw error;
  }
};

const sendMessage = async (channelId, content) => {
  const token = await getStoredToken();
  if (!token) throw new Error('No authentication token');

  try {
    const message = await fetchWithAuth(
      `/channels/${channelId}/messages`,
      token,
      'POST',
      { content }
    );

    // Save the new message to local database
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO messages (id, channel_id, content, author, timestamp) VALUES (?, ?, ?, ?, ?);',
        [message.id, channelId, message.content, message.author.username, message.timestamp]
      );
    });

    return message;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

const getOfflineServers = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM servers;',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

const getOfflineChannels = (serverId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM channels WHERE server_id = ?;',
        [serverId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

const getOfflineMessages = (channelId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM messages WHERE channel_id = ? ORDER BY timestamp DESC;',
        [channelId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

const getLastSyncTime = (key) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT value FROM offline_status WHERE key = ?;',
        [key],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(new Date(rows.item(0).value));
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export {
  initializeDatabase,
  syncServers,
  syncChannels,
  syncMessages,
  sendMessage,
  getOfflineServers,
  getOfflineChannels,
  getOfflineMessages,
  getLastSyncTime
};
