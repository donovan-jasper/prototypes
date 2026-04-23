import { getDatabase } from './database';

interface TimelineEvent {
  id?: number;
  type: string;
  title: string;
  date: Date;
  notes?: string;
  attachments?: string[];
  completed?: boolean;
  userId: number;
}

export async function addTimelineEvent(event: TimelineEvent): Promise<TimelineEvent> {
  const db = await getDatabase();

  const result = await db.runAsync(
    'INSERT INTO timeline_events (type, title, date, notes, attachments, completed, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      event.type,
      event.title,
      event.date.toISOString(),
      event.notes || null,
      event.attachments ? JSON.stringify(event.attachments) : null,
      event.completed ? 1 : 0,
      event.userId
    ]
  );

  return {
    ...event,
    id: result.lastInsertRowId,
  };
}

export async function getTimelineEvents(
  startDate?: Date,
  endDate?: Date,
  userId?: number
): Promise<TimelineEvent[]> {
  const db = await getDatabase();

  let query = 'SELECT * FROM timeline_events WHERE deleted = 0';
  const params: any[] = [];

  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate.toISOString());
  }

  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate.toISOString());
  }

  if (userId) {
    query += ' AND user_id = ?';
    params.push(userId);
  }

  query += ' ORDER BY date DESC';

  const results = await db.getAllAsync(query, params);

  return results.map((row: any) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    date: new Date(row.date),
    notes: row.notes,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
    completed: row.completed === 1,
    userId: row.user_id,
  }));
}

export async function updateTimelineEvent(id: number, updates: Partial<TimelineEvent>): Promise<void> {
  const db = await getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.type !== undefined) {
    fields.push('type = ?');
    values.push(updates.type);
  }

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }

  if (updates.date !== undefined) {
    fields.push('date = ?');
    values.push(updates.date.toISOString());
  }

  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }

  if (updates.attachments !== undefined) {
    fields.push('attachments = ?');
    values.push(JSON.stringify(updates.attachments));
  }

  if (updates.completed !== undefined) {
    fields.push('completed = ?');
    values.push(updates.completed ? 1 : 0);
  }

  if (fields.length === 0) return;

  values.push(id);

  await db.runAsync(
    `UPDATE timeline_events SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteTimelineEvent(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE timeline_events SET deleted = 1 WHERE id = ?', [id]);
}

export async function markScreeningAsCompleted(screeningType: string, userId: number): Promise<void> {
  const db = await getDatabase();

  // First check if there's already a completed entry for this screening type
  const existing = await db.getFirstAsync(
    'SELECT id FROM timeline_events WHERE type = ? AND user_id = ? AND completed = 1 ORDER BY date DESC LIMIT 1',
    ['preventive_care', userId]
  );

  if (existing) {
    // Update the existing entry
    await db.runAsync(
      'UPDATE timeline_events SET date = ?, notes = ? WHERE id = ?',
      [new Date().toISOString(), `Completed ${screeningType} screening`, existing.id]
    );
  } else {
    // Create a new entry
    await db.runAsync(
      'INSERT INTO timeline_events (type, title, date, notes, completed, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        'preventive_care',
        `${screeningType} Screening`,
        new Date().toISOString(),
        `Completed ${screeningType} screening`,
        1,
        userId
      ]
    );
  }
}
