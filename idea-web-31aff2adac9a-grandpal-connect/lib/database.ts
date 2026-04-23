// ... (previous database.ts content remains the same until the insertSessionReport function)

export async function insertSessionReport(report: {
  id: string;
  sessionId: string;
  timestamp: number;
  reason: string;
  status: string;
}): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.runAsync(
    `INSERT INTO session_reports (id, sessionId, timestamp, reason, status)
     VALUES (?, ?, ?, ?, ?)`,
    [report.id, report.sessionId, report.timestamp, report.reason, report.status]
  );
}

// Add this to the database initialization in initDatabase()
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS session_reports (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions(id)
  );
`);
