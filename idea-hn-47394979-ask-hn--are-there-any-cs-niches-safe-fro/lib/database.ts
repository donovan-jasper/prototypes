import * as SQLite from 'expo-sqlite';
import { Assessment } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase() {
  if (db) return;
  
  db = await SQLite.openDatabaseAsync('careershield.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      skills TEXT NOT NULL,
      score INTEGER,
      experience INTEGER,
      timestamp INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      is_premium INTEGER DEFAULT 0,
      subscription_expires INTEGER
    );
  `);
}

export async function saveAssessment(assessment: Assessment) {
  if (!db) await initDatabase();
  
  await db!.runAsync(
    'INSERT INTO assessments (role, skills, score, experience, timestamp) VALUES (?, ?, ?, ?, ?)',
    [assessment.role, JSON.stringify(assessment.skills), assessment.score || 0, assessment.experience, assessment.timestamp]
  );
}

export async function getLatestScore(): Promise<Assessment | null> {
  if (!db) await initDatabase();
  
  const result = await db!.getFirstAsync<any>(
    'SELECT * FROM assessments ORDER BY timestamp DESC LIMIT 1'
  );
  if (!result) return null;
  return {
    role: result.role,
    skills: JSON.parse(result.skills),
    score: result.score,
    experience: result.experience,
    timestamp: result.timestamp
  };
}

export async function isPremiumUser(): Promise<boolean> {
  if (!db) await initDatabase();
  
  const result = await db!.getFirstAsync<any>('SELECT is_premium, subscription_expires FROM user_profile WHERE id = 1');
  if (!result) return false;
  return result.is_premium === 1 && result.subscription_expires > Date.now();
}
