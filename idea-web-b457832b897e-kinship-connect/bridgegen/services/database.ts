import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('bridgegen.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            password TEXT,
            age INTEGER,
            photo TEXT,
            bio TEXT,
            interests TEXT,
            lat REAL,
            lon REAL,
            created_at INTEGER
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS connections (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            match_id TEXT,
            status TEXT,
            created_at INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (match_id) REFERENCES users (id)
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            connection_id TEXT,
            sender_id TEXT,
            text TEXT,
            created_at INTEGER,
            FOREIGN KEY (connection_id) REFERENCES connections (id),
            FOREIGN KEY (sender_id) REFERENCES users (id)
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS check_ins (
            id TEXT PRIMARY KEY,
            connection_id TEXT,
            scheduled_at INTEGER,
            completed_at INTEGER,
            FOREIGN KEY (connection_id) REFERENCES connections (id)
          );`
        );
      },
      (error) => reject(error),
      () => resolve()
    );
  });
};

export const saveUser = (user) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO users (id, name, email, password, age, photo, bio, interests, lat, lon, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
          [user.id, user.name, user.email, user.password, user.age, user.photo, user.bio, JSON.stringify(user.interests), user.lat, user.lon, Date.now()],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getUser = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?;',
          [id],
          (_, { rows }) => resolve(rows._array[0]),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const saveConnection = (connection) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO connections (id, user_id, match_id, status, created_at) VALUES (?, ?, ?, ?, ?);',
          [connection.id, connection.userId, connection.matchId, connection.status, Date.now()],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getConnections = (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM connections WHERE user_id = ?;',
          [userId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const saveMessage = (message) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO messages (id, connection_id, sender_id, text, created_at) VALUES (?, ?, ?, ?, ?);',
          [message.id, message.connectionId, message.senderId, message.text, Date.now()],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getMessages = (connectionId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM messages WHERE connection_id = ? ORDER BY created_at ASC;',
          [connectionId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const saveCheckIn = (checkIn) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO check_ins (id, connection_id, scheduled_at, completed_at) VALUES (?, ?, ?, ?);',
          [checkIn.id, checkIn.connectionId, checkIn.scheduledAt, checkIn.completedAt],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getCheckIns = (connectionId) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM check_ins WHERE connection_id = ? ORDER BY scheduled_at ASC;',
          [connectionId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      }
    );
  });
};
