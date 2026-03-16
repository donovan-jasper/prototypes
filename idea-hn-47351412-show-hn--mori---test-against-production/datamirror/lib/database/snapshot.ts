import * as SQLite from 'expo-sqlite';
import { sanitizeData } from './sanitizer';
import { saveSnapshotFile, loadSnapshotFile } from '../storage/fileSystem';
import { connectToDatabase } from './adapters';

export async function createSnapshot(connection, options) {
  const db = await connectToDatabase(connection);
  const schema = await db.getSchema();
  const data = await db.getData(options);

  const sanitizedData = await sanitizeData(data);

  const localDb = SQLite.openDatabase('snapshot.db');
  await createLocalTables(localDb, schema);
  await insertLocalData(localDb, sanitizedData);

  const filePath = await saveSnapshotFile(localDb);

  return {
    id: Date.now().toString(),
    name: `${connection.database} - ${new Date().toISOString()}`,
    source_connection: connection.id,
    created_at: new Date().toISOString(),
    row_count: sanitizedData.reduce((sum, table) => sum + table.rows.length, 0),
    file_path: filePath,
    schema,
  };
}

export async function loadSnapshot(id) {
  const filePath = await loadSnapshotFile(id);
  const localDb = SQLite.openDatabase(filePath);
  const schema = await getLocalSchema(localDb);
  const rowCount = await getLocalRowCount(localDb);

  return {
    id,
    name: `Snapshot ${id}`,
    source_connection: 'unknown',
    created_at: new Date().toISOString(),
    row_count: rowCount,
    file_path: filePath,
    schema,
  };
}

async function createLocalTables(db, schema) {
  for (const table of schema.tables) {
    const columns = table.columns.map((col) => `${col.name} ${col.type}`).join(', ');
    await db.execAsync(`CREATE TABLE IF NOT EXISTS ${table.name} (${columns})`);
  }
}

async function insertLocalData(db, data) {
  for (const table of data) {
    for (const row of table.rows) {
      const columns = Object.keys(row).join(', ');
      const values = Object.values(row).map((val) => `'${val}'`).join(', ');
      await db.execAsync(`INSERT INTO ${table.name} (${columns}) VALUES (${values})`);
    }
  }
}

async function getLocalSchema(db) {
  const tables = await db.getAllAsync('SELECT name FROM sqlite_master WHERE type="table"');
  const schema = { tables: [] };

  for (const table of tables) {
    const columns = await db.getAllAsync(`PRAGMA table_info(${table.name})`);
    schema.tables.push({
      name: table.name,
      columns: columns.map((col) => ({ name: col.name, type: col.type })),
    });
  }

  return schema;
}

async function getLocalRowCount(db) {
  const tables = await db.getAllAsync('SELECT name FROM sqlite_master WHERE type="table"');
  let totalRows = 0;

  for (const table of tables) {
    const count = await db.getFirstAsync(`SELECT COUNT(*) as count FROM ${table.name}`);
    totalRows += count.count;
  }

  return totalRows;
}
