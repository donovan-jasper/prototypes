import * as SQLite from 'expo-sqlite';
import { UsageEntry } from '../types/models';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('modelmiser.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modelId TEXT NOT NULL,
      taskType TEXT NOT NULL,
      inputTokens INTEGER NOT NULL,
      outputTokens INTEGER NOT NULL,
      cost REAL NOT NULL,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      provider TEXT PRIMARY KEY,
      apiKey TEXT NOT NULL,
      lastUpdated INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_timestamp ON usage(timestamp);
  `);
}

export async function logUsage(entry: UsageEntry): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO usage (modelId, taskType, inputTokens, outputTokens, cost, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    entry.modelId,
    entry.taskType,
    entry.inputTokens,
    entry.outputTokens,
    entry.cost,
    entry.timestamp
  );
  return result.lastInsertRowId;
}

export async function getMonthlyTotal(): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(cost) as total FROM usage WHERE timestamp >= ?',
    startOfMonth.getTime()
  );

  return result?.total || 0;
}

export async function getUsageHistory(limit: number = 50): Promise<UsageEntry[]> {
  const rows = await db.getAllAsync<UsageEntry>(
    'SELECT * FROM usage ORDER BY timestamp DESC LIMIT ?',
    limit
  );
  return rows;
}

export async function getSetting(key: string): Promise<string | null> {
  const result = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    key
  );
  return result?.value || null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}

export async function saveApiKey(provider: string, apiKey: string): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO api_keys (provider, apiKey, lastUpdated) VALUES (?, ?, ?)',
    provider,
    apiKey,
    Date.now()
  );
}

export async function getApiKey(provider: string): Promise<string | null> {
  const result = await db.getFirstAsync<{ apiKey: string }>(
    'SELECT apiKey FROM api_keys WHERE provider = ?',
    provider
  );
  return result?.apiKey || null;
}

export async function getAllApiKeys(): Promise<Record<string, string>> {
  const rows = await db.getAllAsync<{ provider: string; apiKey: string }>(
    'SELECT provider, apiKey FROM api_keys'
  );

  return rows.reduce((acc, row) => {
    acc[row.provider] = row.apiKey;
    return acc;
  }, {} as Record<string, string>);
}
