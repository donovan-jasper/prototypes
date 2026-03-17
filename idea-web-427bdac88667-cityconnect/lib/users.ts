import * as SQLite from 'expo-sqlite';

export interface User {
  id: number;
  name: string;
  email: string;
  interests: string;
  reliabilityScore: number;
  createdAt: string;
}

export interface Organizer {
  id: number;
  name: string;
  eventsHosted: number;
}

export interface Attendee {
  id: number;
  name: string;
  status: 'going' | 'interested';
}

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('localloop.db');
  }
  return db;
}

export async function getOrganizerInfo(userId: number): Promise<Organizer> {
  const database = await getDatabase();
  
  const user = await database.getFirstAsync<User>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Count events hosted by this user
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM activities WHERE organizerId = ?',
    [userId]
  );
  
  return {
    id: user.id,
    name: user.name,
    eventsHosted: result?.count || 0,
  };
}

export async function getActivityAttendees(activityId: number): Promise<Attendee[]> {
  const database = await getDatabase();
  
  const attendees = await database.getAllAsync<{
    id: number;
    name: string;
    status: 'going' | 'interested';
  }>(
    `SELECT u.id, u.name, r.status
     FROM rsvps r
     JOIN users u ON r.userId = u.id
     WHERE r.activityId = ?
     ORDER BY r.createdAt ASC`,
    [activityId]
  );
  
  return attendees;
}

export async function getUserById(userId: number): Promise<User | null> {
  const database = await getDatabase();
  
  const user = await database.getFirstAsync<User>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  
  return user || null;
}
