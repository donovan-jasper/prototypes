import * as SQLite from 'expo-sqlite';
import { CATEGORIES } from '../constants/Categories';

let db: SQLite.SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('localloop.db');

  // Create users table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      interests TEXT,
      reliabilityScore REAL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  // Create activities table with indexes
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      startTime TEXT NOT NULL,
      organizerId INTEGER NOT NULL,
      maxAttendees INTEGER,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (organizerId) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_activities_latitude ON activities(latitude);
    CREATE INDEX IF NOT EXISTS idx_activities_longitude ON activities(longitude);
    CREATE INDEX IF NOT EXISTS idx_activities_startTime ON activities(startTime);
    CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
  `);

  // Create rsvps table with indexes
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activityId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('going', 'interested')),
      createdAt TEXT NOT NULL,
      FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(activityId, userId)
    );

    CREATE INDEX IF NOT EXISTS idx_rsvps_activityId ON rsvps(activityId);
    CREATE INDEX IF NOT EXISTS idx_rsvps_userId ON rsvps(userId);
    CREATE INDEX IF NOT EXISTS idx_rsvps_status ON rsvps(status);
  `);

  // Insert mock user if not exists
  const existingUser = await db.getFirstAsync('SELECT id FROM users WHERE id = 1');
  if (!existingUser) {
    await db.runAsync(
      `INSERT INTO users (id, name, email, interests, reliabilityScore, createdAt)
       VALUES (1, 'Demo User', 'demo@localloop.app', 'sports,food,games', 0.95, ?)`,
      [new Date().toISOString()]
    );
  }

  // Check if activities table is empty and seed if needed
  const activityCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM activities'
  );
  
  if (activityCount && activityCount.count === 0) {
    await seedMockActivities(db);
  }

  return db;
}

async function seedMockActivities(database: SQLite.SQLiteDatabase): Promise<void> {
  // Get user's approximate location (default to a central location)
  const baseLatitude = 35.5951;  // Asheville, NC
  const baseLongitude = -82.5515;

  const activityTemplates = [
    { title: 'Pickup basketball at Lincoln Park', category: 'sports', description: 'Casual 3v3 game, all skill levels welcome. Bring water!' },
    { title: 'Coffee & coding at Brew House', category: 'food', description: 'Working on side projects, come hang and code together' },
    { title: 'Dog walking group meetup', category: 'pets', description: 'Friendly dogs and owners, loop around the neighborhood' },
    { title: 'Board game night at The Grind', category: 'games', description: 'Bringing Catan and Ticket to Ride, open to suggestions' },
    { title: 'Morning yoga in Central Park', category: 'fitness', description: 'Gentle flow session, bring your own mat' },
    { title: 'Guitar jam session', category: 'music', description: 'Acoustic guitars, casual vibe, all levels welcome' },
    { title: 'Photography walk downtown', category: 'creative', description: 'Street photography practice, sharing tips and techniques' },
    { title: 'Trivia night at Murphy\'s Pub', category: 'social', description: 'General knowledge trivia, forming teams on the spot' },
    { title: 'Tennis doubles at Riverside Courts', category: 'sports', description: 'Need 2 more for doubles, intermediate level' },
    { title: 'Book club discussion', category: 'learning', description: 'Discussing "Project Hail Mary", newcomers welcome' },
    { title: 'Frisbee in Memorial Park', category: 'sports', description: 'Ultimate frisbee pickup game, beginners encouraged' },
    { title: 'Sketching at the botanical garden', category: 'creative', description: 'Bring your sketchbook, we\'ll find a nice spot' },
    { title: 'Running club 5K route', category: 'fitness', description: 'Easy pace, 10min/mile average, good for beginners' },
    { title: 'Chess at the library', category: 'games', description: 'Casual games, teaching beginners if interested' },
    { title: 'Brunch at The Corner Cafe', category: 'food', description: 'Meeting new people over coffee and pancakes' },
    { title: 'Volleyball at Sandy Beach', category: 'sports', description: 'Beach volleyball, need a few more players' },
    { title: 'Meditation session in the park', category: 'wellness', description: 'Guided 30-minute meditation, all experience levels' },
    { title: 'Craft beer tasting', category: 'food', description: 'Trying new local brews, meeting at Highland Brewing' },
    { title: 'Improv comedy workshop', category: 'creative', description: 'Fun improv games, no experience needed' },
    { title: 'Bike ride on the greenway', category: 'fitness', description: '10-mile easy ride, stopping for photos' },
    { title: 'Knitting circle at Yarn Shop', category: 'creative', description: 'Working on projects, sharing patterns and tips' },
    { title: 'Ping pong tournament', category: 'games', description: 'Friendly competition at the rec center' },
    { title: 'Salsa dancing lesson', category: 'social', description: 'Beginner-friendly lesson, no partner needed' },
    { title: 'Birdwatching at nature preserve', category: 'nature', description: 'Bring binoculars if you have them, identifying local species' },
    { title: 'Cooking class: Italian pasta', category: 'food', description: 'Making fresh pasta from scratch, sharing recipes' },
    { title: 'Rock climbing at the gym', category: 'fitness', description: 'Bouldering session, belaying for each other' },
    { title: 'Poetry reading open mic', category: 'creative', description: 'Share your work or just listen, supportive crowd' },
    { title: 'Karaoke night', category: 'social', description: 'No judgment zone, just fun singing' },
    { title: 'Farmers market stroll', category: 'food', description: 'Checking out local vendors, maybe grab lunch after' },
    { title: 'Disc golf at Oakwood Park', category: 'sports', description: 'Casual round, have extra discs to share' },
  ];

  const now = new Date();
  
  for (let i = 0; i < activityTemplates.length; i++) {
    const template = activityTemplates[i];
    
    // Random time between 2 and 24 hours from now
    const hoursFromNow = 2 + Math.random() * 22;
    const startTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
    
    // Random distance between 0.2 and 4 miles (converted to approximate lat/lng offset)
    const distanceMiles = 0.2 + Math.random() * 3.8;
    const latOffset = (distanceMiles / 69) * (Math.random() > 0.5 ? 1 : -1);
    const lngOffset = (distanceMiles / 54.6) * (Math.random() > 0.5 ? 1 : -1);
    
    const latitude = baseLatitude + latOffset;
    const longitude = baseLongitude + lngOffset;
    
    // Random attendee count between 1 and 8
    const attendeeCount = Math.floor(Math.random() * 8) + 1;
    const maxAttendees = attendeeCount < 6 ? (attendeeCount + Math.floor(Math.random() * 5) + 2) : null;
    
    await database.runAsync(
      `INSERT INTO activities (title, description, category, latitude, longitude, startTime, organizerId, maxAttendees, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        template.title,
        template.description,
        template.category,
        latitude,
        longitude,
        startTime.toISOString(),
        1, // Demo user as organizer
        maxAttendees,
        now.toISOString(),
      ]
    );
    
    // Add some RSVPs for realism
    const activityId = (await database.getFirstAsync<{ id: number }>(
      'SELECT last_insert_rowid() as id'
    ))!.id;
    
    for (let j = 0; j < Math.min(attendeeCount, 3); j++) {
      await database.runAsync(
        `INSERT INTO rsvps (activityId, userId, status, createdAt)
         VALUES (?, ?, ?, ?)`,
        [activityId, 1, 'going', now.toISOString()]
      );
    }
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
}
