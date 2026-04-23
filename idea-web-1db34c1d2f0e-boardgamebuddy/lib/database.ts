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
          hobby: 'fitness',
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

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Get hangouts within a certain radius
export const getHangoutsNearby = async (
  latitude: number,
  longitude: number,
  radius: number,
  hobbies: string[] = [],
  timeRange: 'any' | 'today' | 'this-week' = 'any'
): Promise<any[]> => {
  try {
    // Build the base query
    let query = `
      SELECT
        h.*,
        (SELECT COUNT(*) FROM attendees WHERE hangoutId = h.id) as attendees
      FROM hangouts h
    `;

    // Add WHERE conditions
    const conditions: string[] = [];
    const params: any = {
      $latitude: latitude,
      $longitude: longitude,
      $radius: radius
    };

    // Distance condition
    conditions.push(`
      calculateDistance($latitude, $longitude, h.latitude, h.longitude) <= $radius
    `);

    // Hobby filter
    if (hobbies.length > 0) {
      conditions.push(`h.hobby IN (${hobbies.map((_, i) => `$hobby${i}`).join(', ')})`);
      hobbies.forEach((hobby, i) => {
        params[`$hobby${i}`] = hobby;
      });
    }

    // Time range filter
    const now = new Date();
    switch (timeRange) {
      case 'today':
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.push(`h.startTime BETWEEN $startTime AND $endTime`);
        params.$startTime = now.toISOString();
        params.$endTime = endOfDay.toISOString();
        break;
      case 'this-week':
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        conditions.push(`h.startTime BETWEEN $startTime AND $endTime`);
        params.$startTime = now.toISOString();
        params.$endTime = endOfWeek.toISOString();
        break;
      // 'any' means no time filter
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add sorting
    query += `
      ORDER BY
        calculateDistance($latitude, $longitude, h.latitude, h.longitude) ASC,
        h.startTime ASC
    `;

    // Execute the query
    const statement = db.prepareSync(query);
    const result = statement.executeSync(params);

    // Convert to array of objects
    const hangouts = result.getAll() as any[];

    // Calculate distance for each hangout
    return hangouts.map(hangout => ({
      ...hangout,
      distance: calculateDistance(
        latitude,
        longitude,
        hangout.latitude,
        hangout.longitude
      )
    }));
  } catch (error) {
    console.error('Error fetching nearby hangouts:', error);
    throw error;
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
    const id = Date.now().toString(); // Simple ID generation

    const statement = db.prepareSync(`
      INSERT INTO hangouts
      (id, title, hobby, latitude, longitude, startTime, maxAttendees, creatorId)
      VALUES ($id, $title, $hobby, $latitude, $longitude, $startTime, $maxAttendees, $creatorId)
    `);

    statement.executeSync({
      $id: id,
      $title: hangoutData.title,
      $hobby: hangoutData.hobby,
      $latitude: hangoutData.latitude,
      $longitude: hangoutData.longitude,
      $startTime: hangoutData.startTime,
      $maxAttendees: hangoutData.maxAttendees,
      $creatorId: hangoutData.creatorId
    });

    return id;
  } catch (error) {
    console.error('Error creating hangout:', error);
    throw error;
  }
};

// Join a hangout
export const joinHangout = async (hangoutId: string, userId: string) => {
  try {
    // Check if user is already attending
    const existing = db.getFirstSync<{count: number}>(
      'SELECT COUNT(*) as count FROM attendees WHERE hangoutId = $hangoutId AND userId = $userId',
      { $hangoutId: hangoutId, $userId: userId }
    );

    if (existing?.count && existing.count > 0) {
      throw new Error('User is already attending this hangout');
    }

    // Check if hangout has space
    const hangout = db.getFirstSync<{maxAttendees: number}>(
      'SELECT maxAttendees FROM hangouts WHERE id = $id',
      { $id: hangoutId }
    );

    if (!hangout) {
      throw new Error('Hangout not found');
    }

    const currentAttendees = db.getFirstSync<{count: number}>(
      'SELECT COUNT(*) as count FROM attendees WHERE hangoutId = $hangoutId',
      { $hangoutId: hangoutId }
    );

    if (currentAttendees?.count && currentAttendees.count >= hangout.maxAttendees) {
      throw new Error('Hangout is full');
    }

    // Add attendee
    const statement = db.prepareSync(`
      INSERT INTO attendees (hangoutId, userId, status)
      VALUES ($hangoutId, $userId, 'going')
    `);

    statement.executeSync({
      $hangoutId: hangoutId,
      $userId: userId
    });

    return true;
  } catch (error) {
    console.error('Error joining hangout:', error);
    throw error;
  }
};

// Get hangouts for a specific user
export const getUserHangouts = async (userId: string, status: 'upcoming' | 'past' = 'upcoming') => {
  try {
    const now = new Date().toISOString();

    let query = `
      SELECT h.*, a.status
      FROM hangouts h
      JOIN attendees a ON h.id = a.hangoutId
      WHERE a.userId = $userId
    `;

    if (status === 'upcoming') {
      query += ` AND h.startTime > $now`;
    } else {
      query += ` AND h.startTime <= $now`;
    }

    query += ` ORDER BY h.startTime ASC`;

    const statement = db.prepareSync(query);
    const result = statement.executeSync({ $userId: userId, $now: now });

    return result.getAll();
  } catch (error) {
    console.error('Error fetching user hangouts:', error);
    throw error;
  }
};

// Get all hobbies
export const getAllHobbies = async () => {
  try {
    const result = db.getAllSync('SELECT * FROM hobbies ORDER BY name ASC');
    return result;
  } catch (error) {
    console.error('Error fetching hobbies:', error);
    throw error;
  }
};
