import * as SQLite from 'expo-sqlite';
import { TensionLog, Reminder, UserSettings, BodyZone, TensionStatus } from '@/types';

let db: SQLite.SQLiteDatabase | null = null;

export function openDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('jawzen.db');
  }
  return db;
}

export async function createTables(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tension_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body_zone TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      body_zone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tension_logs_timestamp ON tension_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_tension_logs_body_zone ON tension_logs(body_zone);
  `);
}

export async function logTension(
  database: SQLite.SQLiteDatabase,
  bodyZone: BodyZone,
  status: TensionStatus,
  timestamp: Date
): Promise<TensionLog> {
  const result = await database.runAsync(
    'INSERT INTO tension_logs (body_zone, status, timestamp) VALUES (?, ?, ?)',
    [bodyZone, status, timestamp.getTime()]
  );

  return {
    id: result.lastInsertRowId,
    bodyZone,
    status,
    timestamp: timestamp.getTime(),
  };
}

export async function getTensionHistory(
  database: SQLite.SQLiteDatabase,
  days: number
): Promise<TensionLog[]> {
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  const result = await database.getAllAsync<{
    id: number;
    body_zone: string;
    status: string;
    timestamp: number;
  }>(
    'SELECT id, body_zone, status, timestamp FROM tension_logs WHERE timestamp >= ? ORDER BY timestamp DESC',
    [cutoffTime]
  );

  return result.map((row) => ({
    id: row.id,
    bodyZone: row.body_zone as BodyZone,
    status: row.status as TensionStatus,
    timestamp: row.timestamp,
  }));
}

export async function getRecentTensionLogs(
  database: SQLite.SQLiteDatabase,
  limit: number
): Promise<TensionLog[]> {
  const result = await database.getAllAsync<{
    id: number;
    body_zone: string;
    status: string;
    timestamp: number;
  }>(
    'SELECT id, body_zone, status, timestamp FROM tension_logs ORDER BY timestamp DESC LIMIT ?',
    [limit]
  );

  return result.map((row) => ({
    id: row.id,
    bodyZone: row.body_zone as BodyZone,
    status: row.status as TensionStatus,
    timestamp: row.timestamp,
  }));
}

export async function saveReminder(
  database: SQLite.SQLiteDatabase,
  time: string,
  bodyZone: BodyZone,
  enabled: boolean = true
): Promise<Reminder> {
  const result = await database.runAsync(
    'INSERT INTO reminders (time, enabled, body_zone) VALUES (?, ?, ?)',
    [time, enabled ? 1 : 0, bodyZone]
  );

  return {
    id: result.lastInsertRowId,
    time,
    enabled,
    bodyZone,
  };
}

export async function getReminders(database: SQLite.SQLiteDatabase): Promise<Reminder[]> {
  const result = await database.getAllAsync<{
    id: number;
    time: string;
    enabled: number;
    body_zone: string;
  }>('SELECT id, time, enabled, body_zone FROM reminders ORDER BY time');

  return result.map((row) => ({
    id: row.id,
    time: row.time,
    enabled: row.enabled === 1,
    bodyZone: row.body_zone as BodyZone,
  }));
}

export async function updateReminderEnabled(
  database: SQLite.SQLiteDatabase,
  id: number,
  enabled: boolean
): Promise<void> {
  await database.runAsync('UPDATE reminders SET enabled = ? WHERE id = ?', [enabled ? 1 : 0, id]);
}

export async function deleteReminder(database: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await database.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
}

export async function getUserSetting(
  database: SQLite.SQLiteDatabase,
  key: string
): Promise<string | null> {
  const result = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_settings WHERE key = ?',
    [key]
  );
  return result?.value || null;
}

export async function setUserSetting(
  database: SQLite.SQLiteDatabase,
  key: string,
  value: string
): Promise<void> {
  await database.runAsync(
    'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}
