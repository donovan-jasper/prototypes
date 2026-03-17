import * as SQLite from 'expo-sqlite';
import { sanitizeData } from './sanitizer';
import { saveSnapshotFile, loadSnapshotFile } from '../storage/fileSystem';
import { connectToDatabase } from './adapters';

export async function createSnapshot(connection, options) {
  try {
    // Connect to the source database
    const db = await connectToDatabase(connection);

    // Get schema and data
    const schema = await db.getSchema();
    const data = await db.getData(options);

    // Sanitize the data
    const sanitizedData = await sanitizeData(data);

    // Create local SQLite database
    const localDb = SQLite.openDatabase('snapshot.db');

    // Create tables in local database
    await createLocalTables(localDb, schema);

    // Insert sanitized data
    await insertLocalData(localDb, sanitizedData);

    // Save the snapshot file
    const filePath = await saveSnapshotFile(localDb);

    // Close connections
    await db.close();

    // Return snapshot metadata
    return {
      id: Date.now().toString(),
      name: `${connection.database} - ${new Date().toISOString()}`,
      source_connection: connection.id,
      created_at: new Date().toISOString(),
      row_count: sanitizedData.reduce((sum, table) => sum + table.rows.length, 0),
      file_path: filePath,
      schema,
    };
  } catch (error) {
    console.error('Error creating snapshot:', error);
    throw error;
  }
}

export async function loadSnapshot(id) {
  try {
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
  } catch (error) {
    console.error('Error loading snapshot:', error);
    throw error;
  }
}

async function createLocalTables(db, schema) {
  for (const table of schema.tables) {
    const columns = table.columns.map((col) => `${col.name} ${col.type}`).join(', ');
    await db.transactionAsync(async (tx) => {
      await tx.executeSqlAsync(`CREATE TABLE IF NOT EXISTS ${table.name} (${columns})`);
    });
  }
}

async function insertLocalData(db, data) {
  for (const table of data) {
    if (table.rows.length === 0) continue;

    const columns = Object.keys(table.rows[0]).join(', ');
    const placeholders = Object.keys(table.rows[0]).map(() => '?').join(', ');

    // Use transaction for better performance
    await db.transactionAsync(async (tx) => {
      for (const row of table.rows) {
        const values = Object.values(row);
        await tx.executeSqlAsync(
          `INSERT INTO ${table.name} (${columns}) VALUES (${placeholders})`,
          values
        );
      }
    });
  }
}

async function getLocalSchema(db) {
  const tables = await db.getAllAsync('SELECT name FROM sqlite_master WHERE type="table"');
  const schema = { tables: [] };

  for (const table of tables) {
    if (table.name.startsWith('sqlite_')) continue; // Skip system tables

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
    if (table.name.startsWith('sqlite_')) continue; // Skip system tables

    const count = await db.getFirstAsync(`SELECT COUNT(*) as count FROM ${table.name}`);
    totalRows += count.count;
  }

  return totalRows;
}
