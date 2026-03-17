import * as SQLite from 'expo-sqlite';
import { DrillResult, UserStats, Achievement } from './types';

let db: SQLite.SQLiteDatabase | null = null;
let isInitialized = false;

const openDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('skillforge.db');
  }
  return db;
};

export const initDatabase = async () => {
  if (isInitialized) return;
  
  const database = await openDatabase();
  
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS drills (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      type TEXT,
      difficulty TEXT,
      duration INTEGER,
      bestScore REAL
    );

    CREATE TABLE IF NOT EXISTS drill_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drillId TEXT,
      score REAL,
      accuracy REAL,
      reactionTime REAL,
      consistency REAL,
      timestamp TEXT,
      FOREIGN KEY (drillId) REFERENCES drills(id)
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      streak INTEGER,
      totalDrills INTEGER,
      totalScore REAL,
      accuracyHistory TEXT,
      reactionTimeHistory TEXT,
      consistencyHistory TEXT
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      icon TEXT,
      unlocked BOOLEAN
    );
  `);
  
  isInitialized = true;
};

export const saveDrillResult = async (result: DrillResult) => {
  const database = await openDatabase();
  await initDatabase();
  
  await database.runAsync(
    'INSERT INTO drill_results (drillId, score, accuracy, reactionTime, consistency, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [result.drillId, result.score.total, result.accuracy, result.reactionTime, result.consistency, result.timestamp]
  );
};

export const getUserStats = async (): Promise<UserStats> => {
  const database = await openDatabase();
  await initDatabase();
  
  const results = await database.getAllAsync('SELECT * FROM drill_results ORDER BY timestamp DESC');
  
  if (results.length === 0) {
    return {
      streak: 0,
      totalDrills: 0,
      totalScore: 0,
      accuracyHistory: [],
      reactionTimeHistory: [],
      consistencyHistory: [],
      achievements: await getAchievements(),
    };
  }
  
  const totalDrills = results.length;
  const totalScore = results.reduce((sum: number, row: any) => sum + row.score, 0);
  const accuracyHistory = results.slice(0, 30).map((row: any) => row.accuracy);
  const reactionTimeHistory = results.slice(0, 30).map((row: any) => row.reactionTime);
  const consistencyHistory = results.slice(0, 30).map((row: any) => row.consistency);
  
  const uniqueDates = new Set(
    results.map((row: any) => new Date(row.timestamp).toDateString())
  );
  const streak = calculateStreak(Array.from(uniqueDates));
  
  return {
    streak,
    totalDrills,
    totalScore,
    accuracyHistory,
    reactionTimeHistory,
    consistencyHistory,
    achievements: await getAchievements(),
  };
};

const calculateStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = dates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecent = new Date(sortedDates[0]);
  mostRecent.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;
  
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    current.setHours(0, 0, 0, 0);
    const previous = new Date(sortedDates[i - 1]);
    previous.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const getAchievements = async (): Promise<Achievement[]> => {
  const database = await openDatabase();
  await initDatabase();
  
  const results = await database.getAllAsync('SELECT * FROM achievements WHERE unlocked = 1');
  
  return results.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
  }));
};
