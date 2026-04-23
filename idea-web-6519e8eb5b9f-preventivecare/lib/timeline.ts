import { getDatabase } from './database';
import { scheduleAllPreventiveCareReminders } from './notifications';

export interface TimelineEvent {
  id?: number;
  type: 'doctor_visit' | 'symptom' | 'medication' | 'lab_result' | 'vaccine' | 'preventive_care';
  title: string;
  date: Date;
  notes?: string;
  attachments?: string[];
  userId?: number;
  completed?: boolean;
}

export async function addTimelineEvent(event: TimelineEvent): Promise<TimelineEvent> {
  const db = await getDatabase();

  const result = await db.runAsync(
    'INSERT INTO timeline_events (type, title, date, notes, attachments, user_id, completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      event.type,
      event.title,
      event.date.toISOString(),
      event.notes || null,
      event.attachments ? JSON.stringify(event.attachments) : null,
      event.userId || 1, // Default to user 1 if not specified
      event.completed || false
    ]
  );

  // If this is a preventive care event, reschedule reminders
  if (event.type === 'preventive_care' && event.userId) {
    await scheduleAllPreventiveCareReminders(event.userId);
  }

  return {
    ...event,
    id: result.lastInsertRowId,
  };
}

export async function getTimelineEvents(startDate?: Date, endDate?: Date, userId?: number): Promise<TimelineEvent[]> {
  const db = await getDatabase();

  let query = 'SELECT * FROM timeline_events';
  const params: any[] = [];

  if (userId) {
    query += ' WHERE user_id = ?';
    params.push(userId);
  }

  if (startDate || endDate) {
    query += userId ? ' AND' : ' WHERE';
    if (startDate && endDate) {
      query += ' date BETWEEN ? AND ?';
      params.push(startDate.toISOString(), endDate.toISOString());
    } else if (startDate) {
      query += ' date >= ?';
      params.push(startDate.toISOString());
    } else if (endDate) {
      query += ' date <= ?';
      params.push(endDate.toISOString());
    }
  }

  query += ' ORDER BY date DESC';

  const events = await db.getAllAsync(query, params);

  return events.map((event: any) => ({
    ...event,
    date: new Date(event.date),
    attachments: event.attachments ? JSON.parse(event.attachments) : [],
  }));
}

export async function updateTimelineEvent(id: number, updates: Partial<TimelineEvent>): Promise<void> {
  const db = await getDatabase();

  const fields = [];
  const values = [];

  if (updates.type) {
    fields.push('type = ?');
    values.push(updates.type);
  }
  if (updates.title) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.date) {
    fields.push('date = ?');
    values.push(updates.date.toISOString());
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }
  if (updates.attachments !== undefined) {
    fields.push('attachments = ?');
    values.push(updates.attachments ? JSON.stringify(updates.attachments) : null);
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

  // If this is a preventive care event, reschedule reminders
  const event = await db.getFirstAsync('SELECT user_id FROM timeline_events WHERE id = ?', [id]);
  if (event && event.user_id) {
    await scheduleAllPreventiveCareReminders(event.user_id);
  }
}

export async function deleteTimelineEvent(id: number): Promise<void> {
  const db = await getDatabase();

  // Get the event to check if it's preventive care
  const event = await db.getFirstAsync('SELECT type, user_id FROM timeline_events WHERE id = ?', [id]);

  await db.runAsync('DELETE FROM timeline_events WHERE id = ?', [id]);

  // If this was a preventive care event, reschedule reminders
  if (event && event.type === 'preventive_care' && event.user_id) {
    await scheduleAllPreventiveCareReminders(event.user_id);
  }
}

export async function markScreeningAsCompleted(screeningType: string, userId: number): Promise<void> {
  const db = await getDatabase();

  // First, check if there's already a completed entry for this screening type
  const existing = await db.getFirstAsync(
    'SELECT * FROM timeline_events WHERE type = ? AND user_id = ? AND completed = 1 ORDER BY date DESC LIMIT 1',
    ['preventive_care', userId]
  );

  if (existing) {
    // Update the existing entry
    await updateTimelineEvent(existing.id, {
      date: new Date(),
      notes: `Completed ${screeningType} screening`
    });
  } else {
    // Create a new entry
    await addTimelineEvent({
      type: 'preventive_care',
      title: `${screeningType} Screening`,
      date: new Date(),
      notes: `Completed ${screeningType} screening`,
      userId,
      completed: true
    });
  }

  // Reschedule all preventive care reminders
  await scheduleAllPreventiveCareReminders(userId);
}
