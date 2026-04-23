// ... (previous database.ts content remains the same until the end)

export async function getWearLogForLastDays(days: number): Promise<WearLogEntry[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const rows = await db.getAllAsync<any>(
    'SELECT * FROM wear_log WHERE wornDate >= ? ORDER BY wornDate DESC',
    cutoffDate.toISOString()
  );

  return rows.map(row => ({
    id: row.id,
    itemIds: JSON.parse(row.itemIds),
    wornDate: row.wornDate,
    weather: row.weather,
    event: row.event
  }));
}

export async function addWearLogEntry(entry: Omit<WearLogEntry, 'id'>): Promise<WearLogEntry> {
  const result = await db.runAsync(
    'INSERT INTO wear_log (itemIds, wornDate, weather, event) VALUES (?, ?, ?, ?)',
    JSON.stringify(entry.itemIds),
    entry.wornDate,
    entry.weather,
    entry.event
  );

  return {
    id: result.lastInsertRowId,
    ...entry
  };
}
