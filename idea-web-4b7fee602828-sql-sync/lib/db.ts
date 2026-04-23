import * as SQLite from 'expo-sqlite';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface Field {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB';
  description?: string;
}

interface Database {
  id: string;
  name: string;
  schema: Field[];
}

const openDatabase = (dbId: string) => {
  return SQLite.openDatabase(`${dbId}.db`);
};

const createDatabase = async (name: string, schema: Field[]): Promise<Database> => {
  const dbId = uuidv4();
  const db = openDatabase(dbId);

  // Create the database table with the specified schema
  const columns = schema.map(field => `${field.name} ${field.type}`).join(', ');
  await db.execAsync([{
    sql: `CREATE TABLE IF NOT EXISTS rows (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columns})`,
    args: []
  }]);

  // Create an index for the id column for faster lookups
  await db.execAsync([{
    sql: 'CREATE INDEX IF NOT EXISTS idx_rows_id ON rows (id)',
    args: []
  }]);

  return { id: dbId, name, schema };
};

const addRow = async (dbId: string, data: { [key: string]: any }) => {
  const db = openDatabase(dbId);

  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);

  const result = await db.runAsync(
    `INSERT INTO rows (${columns}) VALUES (${placeholders})`,
    values
  );

  return result.lastInsertRowId;
};

const queryRows = async (dbId: string, sql: string) => {
  const db = openDatabase(dbId);

  try {
    const result = await db.getAllAsync(sql);
    return result;
  } catch (error: any) {
    console.error('Query execution error:', error);
    throw new Error(`Failed to execute query: ${error.message}`);
  }
};

const updateRow = async (dbId: string, rowId: number, data: { [key: string]: any }) => {
  const db = openDatabase(dbId);

  const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), rowId];

  await db.runAsync(
    `UPDATE rows SET ${updates} WHERE id = ?`,
    values
  );
};

const deleteRow = async (dbId: string, rowId: number) => {
  const db = openDatabase(dbId);

  await db.runAsync(
    'DELETE FROM rows WHERE id = ?',
    [rowId]
  );
};

const deleteDatabase = async (dbId: string) => {
  const db = openDatabase(dbId);

  await db.execAsync([{
    sql: 'DROP TABLE IF EXISTS rows',
    args: []
  }]);
};

const getDatabaseSchema = async (dbId: string): Promise<Field[]> => {
  const db = openDatabase(dbId);

  const result = await db.getAllAsync(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='rows'"
  );

  if (result.length > 0) {
    const createTableSql = result[0].sql;
    const schema: Field[] = [];
    const columnMatches = createTableSql.match(/\(([^)]+)\)/);

    if (columnMatches && columnMatches[1]) {
      const columns = columnMatches[1].split(',').map(col => col.trim());

      for (const column of columns) {
        if (column.toLowerCase().startsWith('id')) continue;

        const [name, type] = column.split(/\s+/);
        schema.push({
          name: name.replace(/"/g, ''),
          type: type.toUpperCase() as Field['type']
        });
      }
    }

    return schema;
  }

  return [];
};

export {
  createDatabase,
  addRow,
  queryRows,
  updateRow,
  deleteRow,
  deleteDatabase,
  getDatabaseSchema
};
