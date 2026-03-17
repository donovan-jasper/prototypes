import { getDatabase, SessionRecord } from './schema';

export async function createSession(
  id: string,
  durationMinutes: number,
  soundscapeId: string | null = null
): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  
  await db.runAsync(
    `INSERT INTO sessions (id, duration_minutes, start_time, end_time, status, energy_rating, soundscape_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, durationMinutes, now, null, 'pending', null, soundscapeId, now]
  );
}

export async function updateSessionStatus(
  id: string,
  status: SessionRecord['status'],
  endTime?: number
): Promise<void> {
  const db = await getDatabase();
  
  if (endTime !== undefined) {
    await db.runAsync(
      'UPDATE sessions SET status = ?, end_time = ? WHERE id = ?',
      [status, endTime, id]
    );
  } else {
    await db.runAsync(
      'UPDATE sessions SET status = ? WHERE id = ?',
      [status, id]
    );
  }
}

export async function updateSessionEnergyRating(
  id: string,
  energyRating: number
): Promise<void> {
  const db = await getDatabase();
  
  await db.runAsync(
    'UPDATE sessions SET energy_rating = ? WHERE id = ?',
    [energyRating, id]
  );
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  const db = await getDatabase();
  
  const result = await db.getFirstAsync<SessionRecord>(
    'SELECT * FROM sessions WHERE id = ?',
    [id]
  );
  
  return result || null;
}

export async function getAllSessions(): Promise<SessionRecord[]> {
  const db = await getDatabase();
  
  const results = await db.getAllAsync<SessionRecord>(
    'SELECT * FROM sessions ORDER BY created_at DESC'
  );
  
  return results;
}

export async function getCompletedSessions(): Promise<SessionRecord[]> {
  const db = await getDatabase();
  
  const results = await db.getAllAsync<SessionRecord>(
    'SELECT * FROM sessions WHERE status = ? ORDER BY created_at DESC',
    ['completed']
  );
  
  return results;
}

export async function getSessionsByDateRange(
  startDate: number,
  endDate: number
): Promise<SessionRecord[]> {
  const db = await getDatabase();
  
  const results = await db.getAllAsync<SessionRecord>(
    'SELECT * FROM sessions WHERE created_at >= ? AND created_at <= ? ORDER BY created_at DESC',
    [startDate, endDate]
  );
  
  return results;
}
