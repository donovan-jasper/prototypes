import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

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
  });
};

const fetchWithAuth = async (endpoint, token) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

const syncServers = async (token) => {
  const servers = await fetchWithAuth('/users/@me/guilds', token);

  db.transaction(tx => {
    servers.forEach(server => {
      tx.executeSql(
        'INSERT OR REPLACE INTO servers (id, name, icon) VALUES (?, ?, ?);',
        [server.id, server.name, server.icon]
      );
    });
  });

  return servers;
};

const syncChannels = async (serverId, token) => {
  const channels = await fetchWithAuth(`/guilds/${serverId}/channels`, token);

  db.transaction(tx => {
    channels.forEach(channel => {
      tx.executeSql(
        'INSERT OR REPLACE INTO channels (id, server_id, name, type) VALUES (?, ?, ?, ?);',
        [channel.id, serverId, channel.name, channel.type]
      );
    });
  });

  return channels;
};

const syncMessages = async (channelId, token) => {
  const messages = await fetchWithAuth(`/channels/${channelId}/messages`, token);

  db.transaction(tx => {
    messages.forEach(message => {
      tx.executeSql(
        'INSERT OR REPLACE INTO messages (id, channel_id, content, author, timestamp) VALUES (?, ?, ?, ?, ?);',
        [message.id, channelId, message.content, message.author.username, message.timestamp]
      );
    });
  });

  return messages;
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

export {
  initializeDatabase,
  syncServers,
  syncChannels,
  syncMessages,
  getOfflineServers,
  getOfflineChannels,
  getOfflineMessages,
};
