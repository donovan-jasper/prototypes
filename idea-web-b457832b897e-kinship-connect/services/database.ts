import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('bridgegen.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create tables if they don't exist
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            age INTEGER,
            photo TEXT,
            interests TEXT,
            lat REAL,
            lon REAL,
            createdAt INTEGER
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS connections (
            id TEXT PRIMARY KEY,
            userId TEXT,
            matchId TEXT,
            matchName TEXT,
            matchPhoto TEXT,
            lastMessage TEXT,
            lastMessageTime INTEGER,
            unreadCount INTEGER,
            status TEXT,
            createdAt INTEGER,
            FOREIGN KEY(userId) REFERENCES users(id),
            FOREIGN KEY(matchId) REFERENCES users(id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            connectionId TEXT,
            senderId TEXT,
            text TEXT,
            createdAt INTEGER,
            status TEXT,
            FOREIGN KEY(connectionId) REFERENCES connections(id),
            FOREIGN KEY(senderId) REFERENCES users(id)
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS check_ins (
            id TEXT PRIMARY KEY,
            connectionId TEXT,
            scheduledAt INTEGER,
            completedAt INTEGER,
            FOREIGN KEY(connectionId) REFERENCES connections(id)
          );`
        );
      },
      (error) => {
        console.error('Database initialization error:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve(true);
      }
    );
  });
};

export const saveMessage = async (message: {
  id: string;
  connectionId: string;
  senderId: string;
  text: string;
  createdAt: number;
  status?: string;
}) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO messages (id, connectionId, senderId, text, createdAt, status)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            message.id,
            message.connectionId,
            message.senderId,
            message.text,
            message.createdAt,
            message.status || 'sent'
          ],
          (_, result) => {
            // Update last message in connection
            tx.executeSql(
              `UPDATE connections
               SET lastMessage = ?, lastMessageTime = ?, unreadCount = unreadCount + 1
               WHERE id = ?;`,
              [message.text, message.createdAt, message.connectionId]
            );
          }
        );
      },
      (error) => {
        console.error('Error saving message:', error);
        reject(error);
      },
      () => {
        resolve(true);
      }
    );
  });
};

export const getMessages = async (connectionId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM messages WHERE connectionId = ? ORDER BY createdAt ASC;`,
          [connectionId],
          (_, { rows: { _array } }) => {
            resolve(_array);
          }
        );
      },
      (error) => {
        console.error('Error getting messages:', error);
        reject(error);
      }
    );
  });
};

export const markMessagesAsRead = async (connectionId: string, userId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Mark messages as read
        tx.executeSql(
          `UPDATE messages
           SET status = 'read'
           WHERE connectionId = ? AND senderId != ? AND status != 'read';`,
          [connectionId, userId]
        );

        // Reset unread count
        tx.executeSql(
          `UPDATE connections
           SET unreadCount = 0
           WHERE id = ?;`,
          [connectionId]
        );
      },
      (error) => {
        console.error('Error marking messages as read:', error);
        reject(error);
      },
      () => {
        resolve(true);
      }
    );
  });
};

export const getConnections = async (userId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM connections WHERE userId = ? ORDER BY lastMessageTime DESC;`,
          [userId],
          (_, { rows: { _array } }) => {
            resolve(_array);
          }
        );
      },
      (error) => {
        console.error('Error getting connections:', error);
        reject(error);
      }
    );
  });
};

export const saveConnection = async (connection: {
  id: string;
  userId: string;
  matchId: string;
  matchName: string;
  matchPhoto: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  status: string;
  createdAt: number;
}) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO connections
           (id, userId, matchId, matchName, matchPhoto, lastMessage, lastMessageTime, unreadCount, status, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            connection.id,
            connection.userId,
            connection.matchId,
            connection.matchName,
            connection.matchPhoto,
            connection.lastMessage,
            connection.lastMessageTime,
            connection.unreadCount,
            connection.status,
            connection.createdAt
          ]
        );
      },
      (error) => {
        console.error('Error saving connection:', error);
        reject(error);
      },
      () => {
        resolve(true);
      }
    );
  });
};
