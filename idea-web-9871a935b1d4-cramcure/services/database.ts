import * as SQLite from 'expo-sqlite';
import { format, parseISO, differenceInDays } from 'date-fns';

export const initDatabase = async (name: string = 'peaceflow.db') => {
  const db = SQLite.openDatabase(name);

  // Create tables if they don't exist
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startDate TEXT NOT NULL,
      endDate TEXT,
      predictedEndDate TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS symptoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      cycleDay INTEGER,
      painLevel INTEGER,
      painType TEXT,
      painLocation TEXT,
      mood TEXT,
      energyLevel INTEGER,
      flowType TEXT,
      notes TEXT,
      FOREIGN KEY (cycleDay) REFERENCES cycles(id)
    );

    CREATE TABLE IF NOT EXISTS relief_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      exerciseId INTEGER,
      beforePainLevel INTEGER,
      afterPainLevel INTEGER,
      duration INTEGER,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      duration INTEGER,
      difficulty TEXT,
      painTypes TEXT,
      isPremium BOOLEAN DEFAULT 0,
      audioFile TEXT,
      instructions TEXT
    );

    CREATE TABLE IF NOT EXISTS user_exercise_favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exerciseId INTEGER NOT NULL,
      addedDate TEXT NOT NULL,
      FOREIGN KEY (exerciseId) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_symptoms_date ON symptoms(date);
    CREATE INDEX IF NOT EXISTS idx_relief_sessions_date ON relief_sessions(date);
  `);

  // Initialize with sample exercises if empty
  const exercises = await db.getAllAsync('SELECT COUNT(*) as count FROM exercises');
  if (exercises[0].count === 0) {
    await db.execAsync(`
      INSERT INTO exercises (title, description, duration, difficulty, painTypes, isPremium, audioFile, instructions)
      VALUES
        ('4-7-8 Breathing', 'A deep breathing exercise to calm your nervous system', 5, 'Easy', 'Anxiety,Cramping', 0, 'breathing.mp3', 'Inhale for 4 seconds, hold for 7, exhale for 8. Repeat for 4 cycles.'),
        ('Pelvic Floor Squeezes', 'Strengthens pelvic floor muscles', 3, 'Medium', 'Pelvic Pain', 0, 'pelvic.mp3', 'Lie on your back, tighten your pelvic muscles, hold for 5 seconds, release. Repeat 10 times.'),
        ('Cat-Cow Stretch', 'Improves spinal mobility', 2, 'Easy', 'Back Pain', 0, 'catcow.mp3', 'On all fours, alternate between arching and dipping your back.'),
        ('Heat Therapy', 'Relieves muscle tension with warmth', 15, 'Easy', 'Muscle Pain', 0, 'heat.mp3', 'Apply heat pack to painful area for 15 minutes.'),
        ('Guided Relaxation', 'Leads you through a calming meditation', 10, 'Easy', 'Anxiety', 1, 'relaxation.mp3', 'Follow the guided instructions to relax your body and mind.'),
        ('Yoga for Pelvic Pain', 'Gentle yoga poses to relieve pelvic discomfort', 12, 'Medium', 'Pelvic Pain', 1, 'yoga.mp3', 'Follow the sequence of gentle yoga poses designed for pelvic pain relief.');
    `);
  }

  return db;
};

export const addSymptom = async (db: SQLite.SQLiteDatabase, symptomData: any) => {
  const { date, cycleDay, painLevel, painType, painLocation, mood, energyLevel, flowType, notes } = symptomData;

  const result = await db.runAsync(
    'INSERT INTO symptoms (date, cycleDay, painLevel, painType, painLocation, mood, energyLevel, flowType, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [date, cycleDay, painLevel, painType, painLocation, mood, energyLevel, flowType, notes]
  );

  return result.lastInsertRowId;
};

export const getSymptomsByDateRange = async (db: SQLite.SQLiteDatabase, startDate: Date, endDate: Date) => {
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  const results = await db.getAllAsync(
    'SELECT * FROM symptoms WHERE date BETWEEN ? AND ? ORDER BY date DESC',
    [startDateStr, endDateStr]
  );

  return results.map(symptom => ({
    ...symptom,
    date: parseISO(symptom.date),
  }));
};

export const addCycle = async (db: SQLite.SQLiteDatabase, cycleData: any) => {
  const { startDate, endDate, predictedEndDate, notes } = cycleData;

  const result = await db.runAsync(
    'INSERT INTO cycles (startDate, endDate, predictedEndDate, notes) VALUES (?, ?, ?, ?)',
    [startDate, endDate, predictedEndDate, notes]
  );

  return result.lastInsertRowId;
};

export const getFavoriteExercises = async (db: SQLite.SQLiteDatabase) => {
  const results = await db.getAllAsync(`
    SELECT e.* FROM exercises e
    JOIN user_exercise_favorites f ON e.id = f.exerciseId
    ORDER BY f.addedDate DESC
  `);

  return results;
};

export const addFavoriteExercise = async (db: SQLite.SQLiteDatabase, exerciseId: number) => {
  const now = new Date().toISOString();

  // Check if already favorited
  const existing = await db.getFirstAsync(
    'SELECT * FROM user_exercise_favorites WHERE exerciseId = ?',
    [exerciseId]
  );

  if (existing) {
    return existing.id;
  }

  const result = await db.runAsync(
    'INSERT INTO user_exercise_favorites (exerciseId, addedDate) VALUES (?, ?)',
    [exerciseId, now]
  );

  return result.lastInsertRowId;
};

export const removeFavoriteExercise = async (db: SQLite.SQLiteDatabase, exerciseId: number) => {
  await db.runAsync(
    'DELETE FROM user_exercise_favorites WHERE exerciseId = ?',
    [exerciseId]
  );
};
