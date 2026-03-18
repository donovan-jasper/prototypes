import * as SQLite from 'expo-sqlite';

export interface Verification {
  id: number;
  timestamp: number;
  trustScore: number;
  service: string;
  token: string;
}

export interface DeviceReputation {
  id: number;
  totalVerifications: number;
  successfulVerifications: number;
  lastUpdated: number;
}

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('humanguard.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      trustScore INTEGER NOT NULL,
      service TEXT NOT NULL,
      token TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_timestamp ON verifications(timestamp);
    
    CREATE TABLE IF NOT EXISTS device_reputation (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      totalVerifications INTEGER NOT NULL DEFAULT 0,
      successfulVerifications INTEGER NOT NULL DEFAULT 0,
      lastUpdated INTEGER NOT NULL
    );
  `);
  
  // Initialize device reputation if not exists
  const existing = await db.getFirstAsync<DeviceReputation>(
    'SELECT * FROM device_reputation WHERE id = 1'
  );
  
  if (!existing) {
    await db.runAsync(
      'INSERT INTO device_reputation (id, totalVerifications, successfulVerifications, lastUpdated) VALUES (1, 0, 0, ?)',
      Date.now()
    );
  }
}

export async function saveVerification(verification: Omit<Verification, 'id'>) {
  const result = await db.runAsync(
    'INSERT INTO verifications (timestamp, trustScore, service, token) VALUES (?, ?, ?, ?)',
    verification.timestamp,
    verification.trustScore,
    verification.service,
    verification.token
  );
  return result.lastInsertRowId;
}

export async function getVerifications(limit = 50): Promise<Verification[]> {
  const result = await db.getAllAsync<Verification>(
    'SELECT * FROM verifications ORDER BY timestamp DESC LIMIT ?',
    limit
  );
  return result;
}

export async function getVerificationCount(): Promise<number> {
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM verifications'
  );
  return result?.count || 0;
}

export async function updateDeviceReputation(success: boolean): Promise<void> {
  await db.runAsync(
    `UPDATE device_reputation 
     SET totalVerifications = totalVerifications + 1,
         successfulVerifications = successfulVerifications + ?,
         lastUpdated = ?
     WHERE id = 1`,
    success ? 1 : 0,
    Date.now()
  );
}

export async function getDeviceReputation(): Promise<number> {
  const result = await db.getFirstAsync<DeviceReputation>(
    'SELECT * FROM device_reputation WHERE id = 1'
  );
  
  if (!result || result.totalVerifications === 0) {
    return 0.5; // Default neutral reputation
  }
  
  return result.successfulVerifications / result.totalVerifications;
}
