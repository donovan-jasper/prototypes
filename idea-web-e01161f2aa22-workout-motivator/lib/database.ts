import * as SQLite from 'expo-sqlite';

export interface Session {
  id?: number;
  taskName: string;
  coachId: string;
  duration: number;
  completedAt: number;
  xpEarned: number;
}

export interface UserStats {
  totalXP: number;
  streakFreezeTokens: number;
  currentStreak: number;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('motivemate.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      taskName TEXT NOT NULL,
      coachId TEXT NOT NULL,
      duration INTEGER NOT NULL,
      completedAt INTEGER NOT NULL,
      xpEarned INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      totalXP INTEGER DEFAULT 0,
      streakFreezeTokens INTEGER DEFAULT 1,
      lastStreakCheck INTEGER DEFAULT 0
    );
    
    INSERT OR IGNORE INTO user_stats (id, totalXP, streakFreezeTokens, lastStreakCheck)
    VALUES (1, 0, 1, 0);
  `);
  
  return db;
}

export async function saveSession(session: Omit<Session, 'id'>): Promise<number> {
  const database = await openDatabase();
  
  const result = await database.runAsync(
    'INSERT INTO sessions (taskName, coachId, duration, completedAt, xpEarned) VALUES (?, ?, ?, ?, ?)',
    session.taskName,
    session.coachId,
    session.duration,
    session.completedAt,
    session.xpEarned
  );
  
  await database.runAsync(
    'UPDATE user_stats SET totalXP = totalXP + ? WHERE id = 1',
    session.xpEarned
  );
  
  return result.lastInsertRowId;
}

export async function getStreak(): Promise<number> {
  const database = await openDatabase();
  
  const now = Date.now();
  const todayStart = new Date(now).setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86400000;
  
  const sessions = await database.getAllAsync<Session>(
    'SELECT * FROM sessions ORDER BY completedAt DESC'
  );
  
  if (sessions.length === 0) return 0;
  
  let streak = 0;
  let checkDate = todayStart;
  const hasToday = sessions.some(s => s.completedAt >= todayStart);
  
  if (!hasToday) {
    const hasYesterday = sessions.some(s => s.completedAt >= yesterdayStart && s.completedAt < todayStart);
    if (!hasYesterday) return 0;
    checkDate = yesterdayStart;
  }
  
  while (true) {
    const dayStart = checkDate;
    const dayEnd = dayStart + 86400000;
    
    const hasSession = sessions.some(s => s.completedAt >= dayStart && s.completedAt < dayEnd);
    
    if (!hasSession) break;
    
    streak++;
    checkDate -= 86400000;
  }
  
  return streak;
}

export async function getUserStats(): Promise<UserStats> {
  const database = await openDatabase();
  
  const stats = await database.getFirstAsync<UserStats>(
    'SELECT totalXP, streakFreezeTokens FROM user_stats WHERE id = 1'
  );
  
  const currentStreak = await getStreak();
  
  return {
    totalXP: stats?.totalXP || 0,
    streakFreezeTokens: stats?.streakFreezeTokens || 1,
    currentStreak,
  };
}

export async function getSessionsByDateRange(startDate: number, endDate: number): Promise<Session[]> {
  const database = await openDatabase();
  
  return await database.getAllAsync<Session>(
    'SELECT * FROM sessions WHERE completedAt >= ? AND completedAt <= ? ORDER BY completedAt DESC',
    startDate,
    endDate
  );
}

export async function getCompletedDates(): Promise<Set<string>> {
  const database = await openDatabase();
  
  const sessions = await database.getAllAsync<Session>(
    'SELECT completedAt FROM sessions'
  );
  
  const dates = new Set<string>();
  sessions.forEach(session => {
    const date = new Date(session.completedAt);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dates.add(dateStr);
  });
  
  return dates;
}

export function calculateXP(durationSeconds: number): number {
  const minutes = Math.floor(durationSeconds / 60);
  return Math.max(10, minutes * 5);
}
