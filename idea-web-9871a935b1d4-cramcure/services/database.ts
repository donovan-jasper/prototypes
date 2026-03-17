import * as SQLite from 'expo-sqlite';

export interface Cycle {
  id?: number;
  startDate: string;
  endDate?: string;
  predictedNextStart?: string;
}

export interface Symptom {
  id?: number;
  date: string;
  cycleDay?: number;
  painLevel: number;
  location?: string;
  type?: string;
  mood?: string;
  energy?: number;
  notes?: string;
}

export interface ReliefSession {
  id?: number;
  exerciseId: string;
  date: string;
  beforePain: number;
  afterPain: number;
  duration: number;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await SQLite.openDatabaseAsync('peaceflow.db');
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startDate TEXT NOT NULL,
      endDate TEXT,
      predictedNextStart TEXT
    );
    
    CREATE TABLE IF NOT EXISTS symptoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      cycleDay INTEGER,
      painLevel INTEGER NOT NULL,
      location TEXT,
      type TEXT,
      mood TEXT,
      energy INTEGER,
      notes TEXT
    );
    
    CREATE TABLE IF NOT EXISTS relief_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exerciseId TEXT NOT NULL,
      date TEXT NOT NULL,
      beforePain INTEGER NOT NULL,
      afterPain INTEGER NOT NULL,
      duration INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_symptoms_date ON symptoms(date);
    CREATE INDEX IF NOT EXISTS idx_cycles_startDate ON cycles(startDate);
    CREATE INDEX IF NOT EXISTS idx_relief_sessions_date ON relief_sessions(date);
  `);

  dbInstance = db;
  return db;
}

export async function addCycle(db: SQLite.SQLiteDatabase, cycle: Omit<Cycle, 'id'>): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO cycles (startDate, endDate, predictedNextStart) VALUES (?, ?, ?)',
    [cycle.startDate, cycle.endDate || null, cycle.predictedNextStart || null]
  );
  return result.lastInsertRowId;
}

export async function getCycles(db: SQLite.SQLiteDatabase, limit?: number): Promise<Cycle[]> {
  const query = limit 
    ? 'SELECT * FROM cycles ORDER BY startDate DESC LIMIT ?'
    : 'SELECT * FROM cycles ORDER BY startDate DESC';
  
  const params = limit ? [limit] : [];
  const rows = await db.getAllAsync<Cycle>(query, params);
  return rows;
}

export async function updateCycle(db: SQLite.SQLiteDatabase, id: number, cycle: Partial<Cycle>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (cycle.startDate !== undefined) {
    fields.push('startDate = ?');
    values.push(cycle.startDate);
  }
  if (cycle.endDate !== undefined) {
    fields.push('endDate = ?');
    values.push(cycle.endDate);
  }
  if (cycle.predictedNextStart !== undefined) {
    fields.push('predictedNextStart = ?');
    values.push(cycle.predictedNextStart);
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  await db.runAsync(
    `UPDATE cycles SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function addSymptom(db: SQLite.SQLiteDatabase, symptom: Omit<Symptom, 'id'>): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO symptoms (date, cycleDay, painLevel, location, type, mood, energy, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      symptom.date,
      symptom.cycleDay || null,
      symptom.painLevel,
      symptom.location || null,
      symptom.type || null,
      symptom.mood || null,
      symptom.energy || null,
      symptom.notes || null
    ]
  );
  return result.lastInsertRowId;
}

export async function getSymptomsByDateRange(
  db: SQLite.SQLiteDatabase,
  startDate: Date,
  endDate: Date
): Promise<Symptom[]> {
  const rows = await db.getAllAsync<Symptom>(
    'SELECT * FROM symptoms WHERE date >= ? AND date <= ? ORDER BY date DESC',
    [startDate.toISOString(), endDate.toISOString()]
  );
  return rows;
}

export async function getSymptomsByDate(db: SQLite.SQLiteDatabase, date: string): Promise<Symptom[]> {
  const rows = await db.getAllAsync<Symptom>(
    'SELECT * FROM symptoms WHERE date LIKE ? ORDER BY id DESC',
    [`${date}%`]
  );
  return rows;
}

export async function getAllSymptoms(db: SQLite.SQLiteDatabase): Promise<Symptom[]> {
  const rows = await db.getAllAsync<Symptom>(
    'SELECT * FROM symptoms ORDER BY date DESC'
  );
  return rows;
}

export async function updateSymptom(db: SQLite.SQLiteDatabase, id: number, symptom: Partial<Symptom>): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (symptom.date !== undefined) {
    fields.push('date = ?');
    values.push(symptom.date);
  }
  if (symptom.cycleDay !== undefined) {
    fields.push('cycleDay = ?');
    values.push(symptom.cycleDay);
  }
  if (symptom.painLevel !== undefined) {
    fields.push('painLevel = ?');
    values.push(symptom.painLevel);
  }
  if (symptom.location !== undefined) {
    fields.push('location = ?');
    values.push(symptom.location);
  }
  if (symptom.type !== undefined) {
    fields.push('type = ?');
    values.push(symptom.type);
  }
  if (symptom.mood !== undefined) {
    fields.push('mood = ?');
    values.push(symptom.mood);
  }
  if (symptom.energy !== undefined) {
    fields.push('energy = ?');
    values.push(symptom.energy);
  }
  if (symptom.notes !== undefined) {
    fields.push('notes = ?');
    values.push(symptom.notes);
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  await db.runAsync(
    `UPDATE symptoms SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteSymptom(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM symptoms WHERE id = ?', [id]);
}

export async function addReliefSession(db: SQLite.SQLiteDatabase, session: Omit<ReliefSession, 'id'>): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO relief_sessions (exerciseId, date, beforePain, afterPain, duration) VALUES (?, ?, ?, ?, ?)',
    [session.exerciseId, session.date, session.beforePain, session.afterPain, session.duration]
  );
  return result.lastInsertRowId;
}

export async function getReliefSessions(db: SQLite.SQLiteDatabase, limit?: number): Promise<ReliefSession[]> {
  const query = limit
    ? 'SELECT * FROM relief_sessions ORDER BY date DESC LIMIT ?'
    : 'SELECT * FROM relief_sessions ORDER BY date DESC';
  
  const params = limit ? [limit] : [];
  const rows = await db.getAllAsync<ReliefSession>(query, params);
  return rows;
}

export async function getReliefSessionsByExercise(db: SQLite.SQLiteDatabase, exerciseId: string): Promise<ReliefSession[]> {
  const rows = await db.getAllAsync<ReliefSession>(
    'SELECT * FROM relief_sessions WHERE exerciseId = ? ORDER BY date DESC',
    [exerciseId]
  );
  return rows;
}

export async function getReliefSessionsByDateRange(
  db: SQLite.SQLiteDatabase,
  startDate: Date,
  endDate: Date
): Promise<ReliefSession[]> {
  const rows = await db.getAllAsync<ReliefSession>(
    'SELECT * FROM relief_sessions WHERE date >= ? AND date <= ? ORDER BY date DESC',
    [startDate.toISOString(), endDate.toISOString()]
  );
  return rows;
}
