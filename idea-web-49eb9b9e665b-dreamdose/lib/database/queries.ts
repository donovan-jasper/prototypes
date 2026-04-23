// Add to existing queries.ts
export async function logCueEvent(
  sessionId: string,
  timestamp: number,
  cueType: 'audio' | 'haptic' | 'both',
  intensity: number
): Promise<void> {
  const db = await openDatabase();
  const id = Date.now().toString();

  await db.runAsync(
    'INSERT INTO cue_events (id, session_id, timestamp, cue_type, intensity) VALUES (?, ?, ?, ?, ?)',
    [id, sessionId, timestamp, cueType, intensity]
  );
}
