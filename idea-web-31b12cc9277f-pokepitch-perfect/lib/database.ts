import * as SQLite from 'expo-sqlite';
import { DrillResult, UserStats, Achievement } from './types';
import { DRILLS } from '../constants/Drills';

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
      difficulty REAL,
      duration INTEGER,
      bestScore REAL,
      difficultyChange REAL
    );

    CREATE TABLE IF NOT EXISTS drill_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drillId TEXT,
      score REAL,
      accuracy REAL,
      reactionTime REAL,
      consistency REAL,
      timestamp TEXT,
      difficulty REAL,
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

  // Seed drills if table is empty
  const drillCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM drills'
  );

  if (drillCount && drillCount.count === 0) {
    for (const drill of DRILLS) {
      await database.runAsync(
        'INSERT INTO drills (id, name, description, type, difficulty, duration, bestScore, difficultyChange) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [drill.id, drill.name, drill.description, drill.type, drill.difficulty, drill.duration, drill.bestScore, null]
      );
    }
  }

  isInitialized = true;
};

export const saveDrillResult = async (result: DrillResult) => {
  const database = await openDatabase();
  await initDatabase();

  await database.runAsync(
    'INSERT INTO drill_results (drillId, score, accuracy, reactionTime, consistency, timestamp, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [result.drillId, result.score, result.accuracy, result.reactionTime, result.consistency, result.timestamp, result.difficulty]
  );

  // Update best score if needed
  const currentBest = await database.getFirstAsync<{ bestScore: number }>(
    'SELECT bestScore FROM drills WHERE id = ?',
    [result.drillId]
  );

  if (currentBest && result.score > currentBest.bestScore) {
    await database.runAsync(
      'UPDATE drills SET bestScore = ? WHERE id = ?',
      [result.score, result.drillId]
    );
  }
};

export const getDrillResults = async (drillId: string): Promise<DrillResult[]> => {
  const database = await openDatabase();
  await initDatabase();

  const results = await database.getAllAsync(
    'SELECT * FROM drill_results WHERE drillId = ? ORDER BY timestamp DESC',
    [drillId]
  );

  return results.map((row: any) => ({
    drillId: row.drillId,
    score: row.score,
    accuracy: row.accuracy,
    reactionTime: row.reactionTime,
    consistency: row.consistency,
    timestamp: row.timestamp,
    difficulty: row.difficulty,
  }));
};

export const updateDrillDifficulty = async (drillId: string, newDifficulty: number) => {
  const database = await openDatabase();
  await initDatabase();

  await database.runAsync(
    'UPDATE drills SET difficulty = ? WHERE id = ?',
    [newDifficulty, drillId]
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

  if (daysDiff === 0) {
    return dates.length;
  } else if (daysDiff === 1) {
    return dates.length;
  } else {
    return 0;
  }
};

const getAchievements = async (): Promise<Achievement[]> => {
  const database = await openDatabase();
  await initDatabase();

  const achievements = await database.getAllAsync('SELECT * FROM achievements');

  if (achievements.length === 0) {
    // Initialize default achievements if none exist
    const defaultAchievements: Achievement[] = [
      {
        id: 'first-drill',
        title: 'First Drill',
        description: 'Complete your first practice drill',
        icon: 'trophy',
        unlocked: false,
      },
      {
        id: 'streak-3',
        title: '3-Day Streak',
        description: 'Complete drills for 3 consecutive days',
        icon: 'flame',
        unlocked: false,
      },
      {
        id: 'accuracy-90',
        title: 'Precision Master',
        description: 'Achieve 90%+ accuracy in a drill',
        icon: 'bullseye',
        unlocked: false,
      },
    ];

    for (const achievement of defaultAchievements) {
      await database.runAsync(
        'INSERT INTO achievements (id, title, description, icon, unlocked) VALUES (?, ?, ?, ?, ?)',
        [achievement.id, achievement.title, achievement.description, achievement.icon, achievement.unlocked]
      );
    }

    return defaultAchievements;
  }

  return achievements.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    unlocked: row.unlocked === 1,
  }));
};
