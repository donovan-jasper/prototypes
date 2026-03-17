import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('datadeck.db');

db.execSync('PRAGMA journal_mode=WAL');

export const createTable = async (name: string, schema: Record<string, string>) => {
  const columns = Object.entries(schema).map(([col, type]) => `"${col}" ${type}`).join(', ');
  const sql = `CREATE TABLE IF NOT EXISTS "${name}" (${columns})`;

  await db.execAsync(sql);
};

export const insertRows = async (table: string, rows: any[]) => {
  if (rows.length === 0) return;

  const batchSize = 1000;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const columns = Object.keys(batch[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;

    await db.withTransactionAsync(async () => {
      for (const row of batch) {
        const values = columns.map(col => row[col]);
        await db.runAsync(sql, values);
      }
    });
  }
};

export const query = async (sql: string, params: any[] = []) => {
  const result = await db.getAllAsync(sql, params);
  const columns = result.length > 0 ? Object.keys(result[0]) : [];
  return { rows: result, columns };
};

export const dropTable = async (name: string) => {
  await db.execAsync(`DROP TABLE IF EXISTS "${name}"`);
};
