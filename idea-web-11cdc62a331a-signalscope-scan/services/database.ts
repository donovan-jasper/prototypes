import * as SQLite from 'expo-sqlite';

export interface SignalReading {
  id?: number;
  latitude: number;
  longitude: number;
  signal_strength: number;
  network_type: string;
  carrier: string | null;
  download_speed: number | null;
  upload_speed: number | null;
  latency: number | null;
  timestamp: number;
}

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  if (db) return;

  db = await SQLite.openDatabaseAsync('signalshift.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS signal_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      signal_strength REAL NOT NULL,
      network_type TEXT NOT NULL,
      carrier TEXT,
      download_speed REAL,
      upload_speed REAL,
      latency REAL,
      timestamp INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_timestamp ON signal_readings(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_location ON signal_readings(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_carrier ON signal_readings(carrier);
  `);
}

export async function saveSignalReading(reading: Omit<SignalReading, 'id'>): Promise<number> {
  if (!db) await initDatabase();

  const result = await db!.runAsync(
    `INSERT INTO signal_readings
     (latitude, longitude, signal_strength, network_type, carrier, download_speed, upload_speed, latency, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reading.latitude,
      reading.longitude,
      reading.signal_strength,
      reading.network_type,
      reading.carrier,
      reading.download_speed,
      reading.upload_speed,
      reading.latency,
      reading.timestamp,
    ]
  );

  return result.lastInsertRowId;
}

export async function getRecentReadings(limit: number = 50): Promise<SignalReading[]> {
  if (!db) await initDatabase();

  const rows = await db!.getAllAsync<SignalReading>(
    'SELECT * FROM signal_readings ORDER BY timestamp DESC LIMIT ?',
    [limit]
  );

  return rows;
}

export async function getReadingsByLocation(latitude: number, longitude: number, radius: number = 0.01): Promise<SignalReading[]> {
  if (!db) await initDatabase();

  const rows = await db!.getAllAsync<SignalReading>(
    `SELECT * FROM signal_readings
     WHERE latitude BETWEEN ? AND ?
     AND longitude BETWEEN ? AND ?
     ORDER BY timestamp DESC`,
    [
      latitude - radius,
      latitude + radius,
      longitude - radius,
      longitude + radius
    ]
  );

  return rows;
}

export async function getReadingById(id: number): Promise<SignalReading | null> {
  if (!db) await initDatabase();

  const row = await db!.getFirstAsync<SignalReading>(
    'SELECT * FROM signal_readings WHERE id = ?',
    [id]
  );

  return row || null;
}

export async function deleteOldReadings(daysToKeep: number = 7): Promise<number> {
  if (!db) await initDatabase();

  const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

  const result = await db!.runAsync(
    'DELETE FROM signal_readings WHERE timestamp < ?',
    [cutoffTime]
  );

  return result.changes;
}

export async function getReadingsCount(): Promise<number> {
  if (!db) await initDatabase();

  const result = await db!.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM signal_readings'
  );

  return result?.count || 0;
}

export async function getCarrierPerformanceStats(carrier: string, limit: number = 100): Promise<{
  avgSignal: number;
  avgSpeed: number;
  reliability: number;
  readingCount: number;
}> {
  if (!db) await initDatabase();

  const rows = await db!.getAllAsync<SignalReading>(
    'SELECT * FROM signal_readings WHERE carrier = ? ORDER BY timestamp DESC LIMIT ?',
    [carrier, limit]
  );

  if (rows.length === 0) {
    return {
      avgSignal: 0,
      avgSpeed: 0,
      reliability: 0,
      readingCount: 0
    };
  }

  const avgSignal = rows.reduce((sum, r) => sum + r.signal_strength, 0) / rows.length;
  const avgSpeed = rows.reduce((sum, r) => sum + (r.download_speed || 0), 0) / rows.length;
  const reliability = rows.filter(r => r.network_type.includes('5G')).length / rows.length * 100;

  return {
    avgSignal: Math.round(avgSignal),
    avgSpeed: Math.round(avgSpeed),
    reliability: Math.round(reliability),
    readingCount: rows.length
  };
}
