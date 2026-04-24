import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('zenblock.db');

interface Room {
  id: number;
  code: string;
  creator: string;
  duration: number;
  createdAt: number;
}

interface RoomStatus {
  code: string;
  duration: number;
  participants: string[];
  createdAt: number;
}

// Initialize the database tables
export const initRoomDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        creator TEXT,
        duration INTEGER,
        created_at INTEGER
      );`
    );
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

// Generate a random 6-character room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new focus room
export const createRoom = (username: string, duration: number): Promise<Room> => {
  return new Promise((resolve, reject) => {
    const code = generateRoomCode();
    const createdAt = Date.now();

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO rooms (code, creator, duration, created_at) VALUES (?, ?, ?, ?)',
        [code, username, duration, createdAt],
        (_, result) => {
          const roomId = result.insertId;
          tx.executeSql(
            'INSERT INTO room_participants (room_id, username, joined_at) VALUES (?, ?, ?)',
            [roomId, username, createdAt],
            () => {
              resolve({
                id: roomId,
                code,
                creator: username,
                duration,
                createdAt
              });
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Join an existing room
export const joinRoom = (code: string, username: string): Promise<RoomStatus> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First find the room by code
      tx.executeSql(
        'SELECT * FROM rooms WHERE code = ?',
        [code],
        (_, { rows }) => {
          if (rows.length === 0) {
            reject(new Error('Room not found'));
            return;
          }

          const room = rows.item(0);
          const joinedAt = Date.now();

          // Add participant to the room
          tx.executeSql(
            'INSERT INTO room_participants (room_id, username, joined_at) VALUES (?, ?, ?)',
            [room.id, username, joinedAt],
            () => {
              // Get all participants
              tx.executeSql(
                'SELECT username FROM room_participants WHERE room_id = ?',
                [room.id],
                (_, { rows: participantRows }) => {
                  const participants = [];
                  for (let i = 0; i < participantRows.length; i++) {
                    participants.push(participantRows.item(i).username);
                  }

                  resolve({
                    code: room.code,
                    duration: room.duration,
                    participants,
                    createdAt: room.created_at
                  });
                },
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Leave a room
export const leaveRoom = (code: string, username: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First find the room by code
      tx.executeSql(
        'SELECT id FROM rooms WHERE code = ?',
        [code],
        (_, { rows }) => {
          if (rows.length === 0) {
            reject(new Error('Room not found'));
            return;
          }

          const roomId = rows.item(0).id;

          // Remove the participant
          tx.executeSql(
            'DELETE FROM room_participants WHERE room_id = ? AND username = ?',
            [roomId, username],
            () => {
              // Check if room is now empty
              tx.executeSql(
                'SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?',
                [roomId],
                (_, { rows: countRows }) => {
                  if (countRows.item(0).count === 0) {
                    // If room is empty, delete it
                    tx.executeSql(
                      'DELETE FROM rooms WHERE id = ?',
                      [roomId],
                      () => resolve(),
                      (_, error) => reject(error)
                    );
                  } else {
                    resolve();
                  }
                },
                (_, error) => reject(error)
              );
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Get current room status
export const getRoomStatus = (code: string): Promise<RoomStatus> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First find the room by code
      tx.executeSql(
        'SELECT * FROM rooms WHERE code = ?',
        [code],
        (_, { rows }) => {
          if (rows.length === 0) {
            reject(new Error('Room not found'));
            return;
          }

          const room = rows.item(0);

          // Get all participants
          tx.executeSql(
            'SELECT username FROM room_participants WHERE room_id = ?',
            [room.id],
            (_, { rows: participantRows }) => {
              const participants = [];
              for (let i = 0; i < participantRows.length; i++) {
                participants.push(participantRows.item(i).username);
              }

              resolve({
                code: room.code,
                duration: room.duration,
                participants,
                createdAt: room.created_at
              });
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};
