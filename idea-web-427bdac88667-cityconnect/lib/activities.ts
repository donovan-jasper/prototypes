import * as SQLite from 'expo-sqlite';

export interface Activity {
  id: number;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  startTime: string;
  organizerId: number;
  maxAttendees: number | null;
  createdAt: string;
}

export interface CreateActivityInput {
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  startTime: string;
  organizerId: number;
  maxAttendees: number | null;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('localloop.db');
  }
  return db;
}

export async function createActivity(input: CreateActivityInput): Promise<number> {
  const database = await getDatabase();
  
  const result = await database.runAsync(
    `INSERT INTO activities (title, description, category, latitude, longitude, startTime, organizerId, maxAttendees, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.description,
      input.category,
      input.latitude,
      input.longitude,
      input.startTime,
      input.organizerId,
      input.maxAttendees,
      new Date().toISOString(),
    ]
  );

  return result.lastInsertRowId;
}

export async function getActivitiesNearby(
  latitude: number,
  longitude: number,
  radiusMiles: number = 1,
  category?: string
): Promise<Activity[]> {
  const database = await getDatabase();
  
  let query = `
    SELECT * FROM activities
    WHERE datetime(startTime) > datetime('now')
    AND datetime(startTime) < datetime('now', '+24 hours')
  `;
  
  const params: any[] = [];
  
  if (category) {
    query += ` AND category = ?`;
    params.push(category);
  }
  
  query += ` ORDER BY startTime ASC`;
  
  const allActivities = await database.getAllAsync<Activity>(query, params);
  
  // Filter by distance using Haversine formula
  const { calculateDistance } = await import('./distance');
  
  return allActivities.filter(activity => {
    const distance = calculateDistance(
      latitude,
      longitude,
      activity.latitude,
      activity.longitude
    );
    return distance <= radiusMiles;
  });
}

export async function getActivityById(id: number): Promise<Activity | null> {
  const database = await getDatabase();
  
  const activity = await database.getFirstAsync<Activity>(
    'SELECT * FROM activities WHERE id = ?',
    [id]
  );
  
  return activity || null;
}

export async function updateRSVP(
  activityId: number,
  userId: number,
  status: 'going' | 'interested' | 'cancelled'
): Promise<void> {
  const database = await getDatabase();
  
  if (status === 'cancelled') {
    await database.runAsync(
      'DELETE FROM rsvps WHERE activityId = ? AND userId = ?',
      [activityId, userId]
    );
  } else {
    await database.runAsync(
      `INSERT OR REPLACE INTO rsvps (activityId, userId, status, createdAt)
       VALUES (?, ?, ?, ?)`,
      [activityId, userId, status, new Date().toISOString()]
    );
  }
}

export async function getRSVPCount(activityId: number): Promise<number> {
  const database = await getDatabase();
  
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM rsvps WHERE activityId = ? AND status = "going"',
    [activityId]
  );
  
  return result?.count || 0;
}

export async function getUserRSVPStatus(
  activityId: number,
  userId: number
): Promise<'going' | 'interested' | null> {
  const database = await getDatabase();
  
  const result = await database.getFirstAsync<{ status: 'going' | 'interested' }>(
    'SELECT status FROM rsvps WHERE activityId = ? AND userId = ?',
    [activityId, userId]
  );
  
  return result?.status || null;
}
