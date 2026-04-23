import * as SQLite from 'expo-sqlite';
import { calculateDistance } from './location';

const db = SQLite.openDatabaseSync('hobbyhub.db');

// Initialize database tables
export const initDatabase = async () => {
  try {
    // Create tables if they don't exist
    db.execSync(`
      CREATE TABLE IF NOT EXISTS hangouts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        hobby TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        startTime TEXT NOT NULL,
        maxAttendees INTEGER DEFAULT 6,
        creatorId TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attendees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hangoutId TEXT NOT NULL,
        userId TEXT NOT NULL,
        status TEXT DEFAULT 'going',
        FOREIGN KEY (hangoutId) REFERENCES hangouts(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        trustScore INTEGER DEFAULT 100,
        premiumStatus BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS hobbies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_hangouts_location ON hangouts(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_hangouts_time ON hangouts(startTime);
    `);

    // Seed initial hobbies if table is empty
    const hobbyCount = db.getFirstSync<number>('SELECT COUNT(*) as count FROM hobbies')?.count || 0;
    if (hobbyCount === 0) {
      const initialHobbies = [
        { id: 'board-games', name: 'Board Games', icon: 'dice', category: 'indoor' },
        { id: 'fitness', name: 'Fitness', icon: 'barbell', category: 'outdoor' },
        { id: 'hiking', name: 'Hiking', icon: 'trail-sign', category: 'outdoor' },
        { id: 'reading', name: 'Reading', icon: 'book', category: 'indoor' },
        { id: 'photography', name: 'Photography', icon: 'camera', category: 'outdoor' },
        { id: 'music', name: 'Music', icon: 'musical-notes', category: 'indoor' },
        { id: 'cooking', name: 'Cooking', icon: 'restaurant', category: 'indoor' },
        { id: 'art', name: 'Art', icon: 'color-palette', category: 'indoor' },
        { id: 'yoga', name: 'Yoga', icon: 'leaf', category: 'outdoor' },
        { id: 'running', name: 'Running', icon: 'walk', category: 'outdoor' },
        { id: 'cycling', name: 'Cycling', icon: 'bicycle', category: 'outdoor' },
        { id: 'chess', name: 'Chess', icon: 'chessboard', category: 'indoor' },
        { id: 'dancing', name: 'Dancing', icon: 'musical-note', category: 'indoor' },
        { id: 'painting', name: 'Painting', icon: 'brush', category: 'indoor' },
        { id: 'writing', name: 'Writing', icon: 'pencil', category: 'indoor' },
        { id: 'gaming', name: 'Video Gaming', icon: 'game-controller', category: 'indoor' },
        { id: 'travel', name: 'Travel', icon: 'airplane', category: 'outdoor' },
        { id: 'volunteering', name: 'Volunteering', icon: 'hand-heart', category: 'outdoor' },
        { id: 'meditation', name: 'Meditation', icon: 'moon', category: 'indoor' },
      ];

      const insertHobby = db.prepareSync('INSERT INTO hobbies (id, name, icon, category) VALUES ($id, $name, $icon, $category)');
      initialHobbies.forEach(hobby => {
        insertHobby.executeSync({
          $id: hobby.id,
          $name: hobby.name,
          $icon: hobby.icon,
          $category: hobby.category
        });
      });
      insertHobby.finalizeSync();
    }

    // Seed sample hangouts if table is empty
    const hangoutCount = db.getFirstSync<number>('SELECT COUNT(*) as count FROM hangouts')?.count || 0;
    if (hangoutCount === 0) {
      const sampleHangouts = [
        {
          id: '1',
          title: 'Board Game Night',
          hobby: 'board-games',
          latitude: 40.7128,
          longitude: -74.0060,
          startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          maxAttendees: 6,
          creatorId: 'user1'
        },
        {
          id: '2',
          title: 'Morning Yoga',
          hobby: 'yoga',
          latitude: 40.7138,
          longitude: -74.0070,
          startTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
          maxAttendees: 10,
          creatorId: 'user2'
        },
        {
          id: '3',
          title: 'Hiking Adventure',
          hobby: 'hiking',
          latitude: 40.7148,
          longitude: -74.0080,
          startTime: new Date(Date.now() + 10800000).toISOString(), // 3 hours from now
          maxAttendees: 8,
          creatorId: 'user3'
        },
        {
          id: '4',
          title: 'Book Club Meeting',
          hobby: 'reading',
          latitude: 40.7158,
          longitude: -74.0090,
          startTime: new Date(Date.now() + 14400000).toISOString(), // 4 hours from now
          maxAttendees: 5,
          creatorId: 'user4'
        },
        {
          id: '5',
          title: 'Friday Night Drinks',
          hobby: 'socializing',
          latitude: 40.7168,
          longitude: -74.0100,
          startTime: new Date(Date.now() + 18000000).toISOString(), // 5 hours from now
          maxAttendees: 12,
          creatorId: 'user5'
        }
      ];

      const insertHangout = db.prepareSync(
        'INSERT INTO hangouts (id, title, hobby, latitude, longitude, startTime, maxAttendees, creatorId) ' +
        'VALUES ($id, $title, $hobby, $latitude, $longitude, $startTime, $maxAttendees, $creatorId)'
      );

      sampleHangouts.forEach(hangout => {
        insertHangout.executeSync({
          $id: hangout.id,
          $title: hangout.title,
          $hobby: hangout.hobby,
          $latitude: hangout.latitude,
          $longitude: hangout.longitude,
          $startTime: hangout.startTime,
          $maxAttendees: hangout.maxAttendees,
          $creatorId: hangout.creatorId
        });
      });

      insertHangout.finalizeSync();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Create a new hangout
export const createHangout = async (hangoutData: {
  title: string;
  hobby: string;
  latitude: number;
  longitude: number;
  startTime: string;
  maxAttendees: number;
  creatorId: string;
}) => {
  try {
    const id = Date.now().toString();

    await db.runAsync(
      'INSERT INTO hangouts (id, title, hobby, latitude, longitude, startTime, maxAttendees, creatorId) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        hangoutData.title,
        hangoutData.hobby,
        hangoutData.latitude,
        hangoutData.longitude,
        hangoutData.startTime,
        hangoutData.maxAttendees,
        hangoutData.creatorId
      ]
    );

    return id;
  } catch (error) {
    console.error('Error creating hangout:', error);
    throw error;
  }
};

// Get hangouts nearby
export const getHangoutsNearby = async (latitude: number, longitude: number, radius: number = 5) => {
  try {
    const hangouts = await db.getAllAsync<{
      id: string;
      title: string;
      hobby: string;
      latitude: number;
      longitude: number;
      startTime: string;
      maxAttendees: number;
      creatorId: string;
    }>('SELECT * FROM hangouts');

    // Filter hangouts within radius
    const nearbyHangouts = hangouts.filter(hangout => {
      const distance = calculateDistance(
        { latitude, longitude },
        { latitude: hangout.latitude, longitude: hangout.longitude }
      );
      return distance <= radius;
    });

    return nearbyHangouts;
  } catch (error) {
    console.error('Error getting nearby hangouts:', error);
    throw error;
  }
};

// Get hangout by ID
export const getHangoutById = async (id: string) => {
  try {
    const hangout = await db.getFirstAsync<{
      id: string;
      title: string;
      hobby: string;
      latitude: number;
      longitude: number;
      startTime: string;
      maxAttendees: number;
      creatorId: string;
    }>('SELECT * FROM hangouts WHERE id = ?', [id]);

    return hangout;
  } catch (error) {
    console.error('Error getting hangout by ID:', error);
    throw error;
  }
};

// Get attendees for a hangout
export const getAttendeesForHangout = async (hangoutId: string) => {
  try {
    const attendees = await db.getAllAsync<{
      id: number;
      hangoutId: string;
      userId: string;
      status: string;
    }>('SELECT * FROM attendees WHERE hangoutId = ?', [hangoutId]);

    return attendees;
  } catch (error) {
    console.error('Error getting attendees for hangout:', error);
    throw error;
  }
};

// Add attendee to hangout
export const addAttendeeToHangout = async (hangoutId: string, userId: string) => {
  try {
    await db.runAsync(
      'INSERT INTO attendees (hangoutId, userId, status) VALUES (?, ?, ?)',
      [hangoutId, userId, 'going']
    );
  } catch (error) {
    console.error('Error adding attendee to hangout:', error);
    throw error;
  }
};

// Remove attendee from hangout
export const removeAttendeeFromHangout = async (hangoutId: string, userId: string) => {
  try {
    await db.runAsync(
      'DELETE FROM attendees WHERE hangoutId = ? AND userId = ?',
      [hangoutId, userId]
    );
  } catch (error) {
    console.error('Error removing attendee from hangout:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  try {
    const user = await db.getFirstAsync<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      trustScore: number;
      premiumStatus: boolean;
    }>('SELECT * FROM users WHERE id = ?', [userId]);

    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// Update user location
export const updateUserLocation = async (userId: string, latitude: number, longitude: number) => {
  try {
    await db.runAsync(
      'UPDATE users SET latitude = ?, longitude = ? WHERE id = ?',
      [latitude, longitude, userId]
    );
  } catch (error) {
    console.error('Error updating user location:', error);
    throw error;
  }
};

// Get all hobbies
export const getAllHobbies = async () => {
  try {
    const hobbies = await db.getAllAsync<{
      id: string;
      name: string;
      icon: string;
      category: string;
    }>('SELECT * FROM hobbies ORDER BY name');

    return hobbies;
  } catch (error) {
    console.error('Error getting all hobbies:', error);
    throw error;
  }
};
