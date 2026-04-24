import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('zenblock.db');

// Initialize all database tables
export const initDB = () => {
  // Focus sessions table
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS focus_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time INTEGER,
        end_time INTEGER,
        duration INTEGER,
        mode TEXT,
        completed INTEGER
      );`
    );

    // Blocked apps table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS blocked_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        app_name TEXT,
        FOREIGN KEY(session_id) REFERENCES focus_sessions(id)
      );`
    );

    // Rooms table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        creator TEXT,
        duration INTEGER,
        created_at INTEGER
      );`
    );

    // Room participants table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS room_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        username TEXT,
        joined_at INTEGER,
        FOREIGN KEY(room_id) REFERENCES rooms(id)
      );`
    );
  });
};

// Save a focus session to the database
export const saveFocusSession = (session: {
  startTime: number;
  endTime: number;
  duration: number;
  mode: string;
  completed: boolean;
  blockedApps: string[];
}) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO focus_sessions (start_time, end_time, duration, mode, completed) VALUES (?, ?, ?, ?, ?)',
        [session.startTime, session.endTime, session.duration, session.mode, session.completed ? 1 : 0],
        (_, result) => {
          const sessionId = result.insertId;

          // Insert blocked apps
          session.blockedApps.forEach(app => {
            tx.executeSql(
              'INSERT INTO blocked_apps (session_id, app_name) VALUES (?, ?)',
              [sessionId, app]
            );
          });

          resolve(sessionId);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Get all focus sessions
export const getFocusSessions = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM focus_sessions ORDER BY start_time DESC',
        [],
        (_, { rows }) => {
          const sessions = [];
          for (let i = 0; i < rows.length; i++) {
            sessions.push(rows.item(i));
          }
          resolve(sessions);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Save a room to the database
export const saveRoom = (room: {
  code: string;
  creator: string;
  duration: number;
  createdAt: number;
}) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO rooms (code, creator, duration, created_at) VALUES (?, ?, ?, ?)',
        [room.code, room.creator, room.duration, room.createdAt],
        (_, result) => {
          resolve(result.insertId);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Get all rooms
export const getRooms = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM rooms ORDER BY created_at DESC',
        [],
        (_, { rows }) => {
          const rooms = [];
          for (let i = 0; i < rows.length; i++) {
            rooms.push(rows.item(i));
          }
          resolve(rooms);
        },
        (_, error) => reject(error)
      );
    });
  });
};
