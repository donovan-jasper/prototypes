import * as SQLite from 'expo-sqlite';
import { DrillResult, UserStats, Achievement, Drill } from './types';
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

export const getAllDrills = async (): Promise<Drill[]> => {
  const database = await openDatabase();
  await initDatabase();

  const results = await database.getAllAsync('SELECT * FROM drills');

  return results.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    difficulty: row.difficulty,
    duration: row.duration,
    bestScore: row.bestScore,
    difficultyChange: row.difficultyChange || 0,
  }));
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

  // Calculate streak
  let streak = 0;
  let lastDate = new Date(results[0].timestamp);
  const today = new Date();

  // Reset time parts for comparison
  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Check if last drill was today
  if (lastDate.getTime() === today.getTime()) {
    streak = 1;

    // Check previous days for streak
    for (let i = 1; i < results.length; i++) {
      const currentDate = new Date(results[i].timestamp);
      currentDate.setHours(0, 0, 0, 0);

      // If the date is consecutive day
      if (lastDate.getTime() - currentDate.getTime() === 86400000) {
        streak++;
        lastDate = currentDate;
      } else {
        break;
      }
    }
  }

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

export const getAchievements = async (): Promise<Achievement[]> => {
  const database = await openDatabase();
  await initDatabase();

  // Check if achievements table is empty and seed if needed
  const achievementCount = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM achievements'
  );

  if (achievementCount && achievementCount.count === 0) {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first-drill',
        title: 'First Steps',
        description: 'Complete your first drill',
        icon: 'trophy-outline',
        unlocked: false,
      },
      {
        id: 'streak-3',
        title: '3-Day Streak',
        description: 'Complete drills for 3 consecutive days',
        icon: 'flame-outline',
        unlocked: false,
      },
      {
        id: 'accuracy-90',
        title: 'Precision Master',
        description: 'Achieve 90% accuracy in a drill',
        icon: 'star-outline',
        unlocked: false,
      },
      {
        id: 'perfect-score',
        title: 'Perfect Score',
        description: 'Get a perfect score in a drill',
        icon: 'ribbon-outline',
        unlocked: false,
      },
    ];

    for (const achievement of defaultAchievements) {
      await database.runAsync(
        'INSERT INTO achievements (id, title, description, icon, unlocked) VALUES (?, ?, ?, ?, ?)',
        [achievement.id, achievement.title, achievement.description, achievement.icon, achievement.unlocked]
      );
    }
  }

  const results = await database.getAllAsync('SELECT * FROM achievements');
  return results.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    unlocked: row.unlocked === 1, // SQLite returns 1/0 for booleans
  }));
};

export const unlockAchievement = async (achievementId: string) => {
  const database = await openDatabase();
  await initDatabase();

  await database.runAsync(
    'UPDATE achievements SET unlocked = 1 WHERE id = ?',
    [achievementId]
  );
};
