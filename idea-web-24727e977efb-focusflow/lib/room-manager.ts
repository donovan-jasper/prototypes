import * as SQLite from 'expo-sqlite';
import { useSQLiteContext } from 'expo-sqlite';

interface Room {
  id: number;
  code: string;
  creator: string;
  duration: number;
  createdAt: number;
}

interface RoomStatus {
  code: string;
  creator: string;
  duration: number;
  participants: string[];
  createdAt: number;
  timeRemaining: number;
}

// Initialize the database tables
export const initRoomDB = async () => {
  const db = useSQLiteContext();
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE,
        creator TEXT,
        duration INTEGER,
        created_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS room_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        username TEXT,
        joined_at INTEGER,
        FOREIGN KEY(room_id) REFERENCES rooms(id)
      );
    `);
  } catch (error) {
    console.error('Error initializing room database:', error);
    throw error;
  }
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
export const createRoom = async (username: string, duration: number): Promise<Room> => {
  const db = useSQLiteContext();
  const code = generateRoomCode();
  const createdAt = Date.now();

  try {
    // Insert the room
    const result = await db.runAsync(
      'INSERT INTO rooms (code, creator, duration, created_at) VALUES (?, ?, ?, ?)',
      [code, username, duration, createdAt]
    );

    const roomId = result.lastInsertRowId;

    // Add creator as first participant
    await db.runAsync(
      'INSERT INTO room_participants (room_id, username, joined_at) VALUES (?, ?, ?)',
      [roomId, username, createdAt]
    );

    return {
      id: roomId,
      code,
      creator: username,
      duration,
      createdAt
    };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// Join an existing room
export const joinRoom = async (code: string, username: string): Promise<RoomStatus> => {
  const db = useSQLiteContext();

  try {
    // Find the room by code
    const roomResult = await db.getFirstAsync(
      'SELECT * FROM rooms WHERE code = ?',
      [code]
    );

    if (!roomResult) {
      throw new Error('Room not found');
    }

    const joinedAt = Date.now();

    // Check if user is already in the room
    const existingParticipant = await db.getFirstAsync(
      'SELECT * FROM room_participants WHERE room_id = ? AND username = ?',
      [roomResult.id, username]
    );

    if (!existingParticipant) {
      // Add participant to the room
      await db.runAsync(
        'INSERT INTO room_participants (room_id, username, joined_at) VALUES (?, ?, ?)',
        [roomResult.id, username, joinedAt]
      );
    }

    // Get all participants
    const participantsResult = await db.getAllAsync(
      'SELECT username FROM room_participants WHERE room_id = ?',
      [roomResult.id]
    );

    const participants = participantsResult.map(row => row.username);

    // Calculate time remaining
    const elapsedTime = Math.floor((Date.now() - roomResult.created_at) / 1000 / 60);
    const timeRemaining = Math.max(0, roomResult.duration - elapsedTime);

    return {
      code: roomResult.code,
      creator: roomResult.creator,
      duration: roomResult.duration,
      participants,
      createdAt: roomResult.created_at,
      timeRemaining
    };
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

// Leave a room
export const leaveRoom = async (code: string, username: string): Promise<void> => {
  const db = useSQLiteContext();

  try {
    // Find the room by code
    const roomResult = await db.getFirstAsync(
      'SELECT id FROM rooms WHERE code = ?',
      [code]
    );

    if (!roomResult) {
      throw new Error('Room not found');
    }

    // Remove the participant
    await db.runAsync(
      'DELETE FROM room_participants WHERE room_id = ? AND username = ?',
      [roomResult.id, username]
    );

    // Check if room is now empty
    const countResult = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?',
      [roomResult.id]
    );

    if (countResult.count === 0) {
      // If room is empty, delete it
      await db.runAsync(
        'DELETE FROM rooms WHERE id = ?',
        [roomResult.id]
      );
    }
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error;
  }
};

// Get room status
export const getRoomStatus = async (code: string): Promise<RoomStatus> => {
  const db = useSQLiteContext();

  try {
    // Find the room by code
    const roomResult = await db.getFirstAsync(
      'SELECT * FROM rooms WHERE code = ?',
      [code]
    );

    if (!roomResult) {
      throw new Error('Room not found');
    }

    // Get all participants
    const participantsResult = await db.getAllAsync(
      'SELECT username FROM room_participants WHERE room_id = ?',
      [roomResult.id]
    );

    const participants = participantsResult.map(row => row.username);

    // Calculate time remaining
    const elapsedTime = Math.floor((Date.now() - roomResult.created_at) / 1000 / 60);
    const timeRemaining = Math.max(0, roomResult.duration - elapsedTime);

    return {
      code: roomResult.code,
      creator: roomResult.creator,
      duration: roomResult.duration,
      participants,
      createdAt: roomResult.created_at,
      timeRemaining
    };
  } catch (error) {
    console.error('Error getting room status:', error);
    throw error;
  }
};

// Poll room updates every 5 seconds
export const pollRoomUpdates = (code: string, callback: (status: RoomStatus) => void) => {
  const interval = setInterval(async () => {
    try {
      const status = await getRoomStatus(code);
      callback(status);
    } catch (error) {
      console.error('Error polling room updates:', error);
    }
  }, 5000);

  // Return cleanup function
  return () => clearInterval(interval);
};
