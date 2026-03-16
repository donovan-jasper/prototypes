import * as SQLite from 'expo-sqlite';
import { DrillResult, UserStats, Achievement } from './types';

const db = SQLite.openDatabase('skillforge.db');

export const initDatabase = async () => {
  await db.transactionAsync(async (tx) => {
    await tx.executeSqlAsync(`
      CREATE TABLE IF NOT EXISTS drills (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        type TEXT,
        difficulty TEXT,
        duration INTEGER,
        bestScore REAL
      );
    `);

    await tx.executeSqlAsync(`
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
    `);

    await tx.executeSqlAsync(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        streak INTEGER,
        totalDrills INTEGER,
        totalScore REAL,
        accuracyHistory TEXT,
        reactionTimeHistory TEXT,
        consistencyHistory TEXT
      );
    `);

    await tx.executeSqlAsync(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        icon TEXT,
        unlocked BOOLEAN
      );
    `);
  });
};

export const saveDrillResult = async (result: DrillResult) => {
  await db.transactionAsync(async (tx) => {
    await tx.executeSqlAsync(
      'INSERT INTO drill_results (drillId, score, accuracy, reactionTime, consistency, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [result.drillId, result.score.total, result.accuracy, result.reactionTime, result.consistency, result.timestamp]
    );
  });
};

export const getUserStats = async (): Promise<UserStats> => {
  return await db.transactionAsync(async (tx) => {
    const [result] = await tx.executeSqlAsync('SELECT * FROM user_stats ORDER BY id DESC LIMIT 1');
    if (result.rows.length > 0) {
      return {
        streak: result.rows.item(0).streak,
        totalDrills: result.rows.item(0).totalDrills,
        totalScore: result.rows.item(0).totalScore,
        accuracyHistory: JSON.parse(result.rows.item(0).accuracyHistory),
        reactionTimeHistory: JSON.parse(result.rows.item(0).reactionTimeHistory),
        consistencyHistory: JSON.parse(result.rows.item(0).consistencyHistory),
        achievements: await getAchievements(),
      };
    } else {
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
  });
};

export const getAchievements = async (): Promise<Achievement[]> => {
  return await db.transactionAsync(async (tx) => {
    const [result] = await tx.executeSqlAsync('SELECT * FROM achievements WHERE unlocked = 1');
    const achievements: Achievement[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      achievements.push({
        id: result.rows.item(i).id,
        title: result.rows.item(i).title,
        description: result.rows.item(i).description,
        icon: result.rows.item(i).icon,
      });
    }
    return achievements;
  });
};
