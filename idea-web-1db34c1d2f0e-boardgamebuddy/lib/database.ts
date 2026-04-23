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
    // Calculate time range filter
    let timeFilter = '';
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    if (timeRange === 'today') {
      timeFilter = `AND startTime BETWEEN '${now.toISOString()}' AND '${endOfDay.toISOString()}'`;
    } else if (timeRange === 'this-week') {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      endOfWeek.setHours(23, 59, 59, 999);
      timeFilter = `AND startTime BETWEEN '${now.toISOString()}' AND '${endOfWeek.toISOString()}'`;
    }

    // Calculate hobby filter
    let hobbyFilter = '';
    if (hobbies.length > 0) {
      const hobbyPlaceholders = hobbies.map(() => '?').join(',');
      hobbyFilter = `AND hobby IN (${hobbyPlaceholders})`;
    }

    // Query hangouts within radius
    const query = `
      SELECT
        h.*,
        COUNT(a.id) as attendees,
        (6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(h.latitude)) *
          COS(RADIANS(h.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(h.latitude))
        )) as distance
      FROM hangouts h
      LEFT JOIN attendees a ON h.id = a.hangoutId AND a.status = 'going'
      WHERE
        (6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(h.latitude)) *
          COS(RADIANS(h.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(h.latitude))
        )) <= ?
        ${timeFilter}
        ${hobbyFilter}
      GROUP BY h.id
      ORDER BY distance ASC, startTime ASC
    `;

    const stmt = db.prepareSync(query);

    // Bind parameters
    const params = [
      latitude, longitude, latitude, // For distance calculation
      latitude, longitude, latitude, // For distance calculation
      radius
    ];

    // Add hobby parameters if any
    if (hobbies.length > 0) {
      params.push(...hobbies);
    }

    const result = stmt.executeSync(...params) as any[];
    stmt.finalizeSync();

    // Format the results
    return result.map(row => ({
      id: row.id,
      title: row.title,
      hobby: row.hobby,
      distance: parseFloat(row.distance.toFixed(1)),
      startTime: row.startTime,
      attendees: row.attendees || 0,
      maxAttendees: row.maxAttendees,
      latitude: row.latitude,
      longitude: row.longitude
    }));
  } catch (error) {
    console.error('Error getting nearby hangouts:', error);
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
    const id = crypto.randomUUID();
    const stmt = db.prepareSync(`
      INSERT INTO hangouts
      (id, title, hobby, latitude, longitude, startTime, maxAttendees, creatorId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.executeSync(
      id,
      hangoutData.title,
      hangoutData.hobby,
      hangoutData.latitude,
      hangoutData.longitude,
      hangoutData.startTime,
      hangoutData.maxAttendees,
      hangoutData.creatorId
    );

    stmt.finalizeSync();
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
      'SELECT COUNT(*) as count FROM attendees WHERE hangoutId = ? AND userId = ?',
      [hangoutId, userId]
    );

    if (existing?.count && existing.count > 0) {
      throw new Error('User is already attending this hangout');
    }

    // Check if hangout has space
    const hangout = db.getFirstSync<{maxAttendees: number}>(
      'SELECT maxAttendees FROM hangouts WHERE id = ?',
      [hangoutId]
    );

    if (!hangout) {
      throw new Error('Hangout not found');
    }

    const currentAttendees = db.getFirstSync<{count: number}>(
      'SELECT COUNT(*) as count FROM attendees WHERE hangoutId = ? AND status = "going"',
      [hangoutId]
    );

    if (currentAttendees?.count && currentAttendees.count >= hangout.maxAttendees) {
      throw new Error('Hangout is full');
    }

    // Add attendee
    const stmt = db.prepareSync(
      'INSERT INTO attendees (hangoutId, userId, status) VALUES (?, ?, "going")'
    );

    stmt.executeSync(hangoutId, userId);
    stmt.finalizeSync();

    return true;
  } catch (error) {
    console.error('Error joining hangout:', error);
    throw error;
  }
};

// Get hangout details
export const getHangoutDetails = async (hangoutId: string) => {
  try {
    const hangout = db.getFirstSync(`
      SELECT
        h.*,
        COUNT(a.id) as attendees,
        u.name as creatorName,
        u.trustScore as creatorTrustScore
      FROM hangouts h
      LEFT JOIN attendees a ON h.id = a.hangoutId AND a.status = 'going'
      LEFT JOIN users u ON h.creatorId = u.id
      WHERE h.id = ?
      GROUP BY h.id
    `, [hangoutId]);

    if (!hangout) {
      throw new Error('Hangout not found');
    }

    // Get attendees
    const attendees = db.getAllSync(`
      SELECT
        u.id,
        u.name,
        u.trustScore,
        a.status
      FROM attendees a
      JOIN users u ON a.userId = u.id
      WHERE a.hangoutId = ?
      ORDER BY a.id
    `, [hangoutId]);

    return {
      ...hangout,
      attendees: attendees || []
    };
  } catch (error) {
    console.error('Error getting hangout details:', error);
    throw error;
  }
};
