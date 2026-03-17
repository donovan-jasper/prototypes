import * as SQLite from 'expo-sqlite';

const openDatabase = (dbName) => {
  return SQLite.openDatabase(`${dbName}.db`);
};

const createDatabase = async (name, schema) => {
  const db = openDatabase(name);

  // Create the database with the specified schema
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

  return { id: name, name, schema };
};

const addRow = async (dbId, data) => {
  const db = openDatabase(dbId);

  // Prepare the SQL statement
  const columns = Object.keys(data).join(', ');
  const placeholders = Object.keys(data).map(() => '?').join(', ');
  const values = Object.values(data);

  // Execute the insert
  const result = await db.runAsync(
    `INSERT INTO rows (${columns}) VALUES (${placeholders})`,
    values
  );

  return result.lastInsertRowId;
};

const queryRows = async (dbId, sql) => {
  const db = openDatabase(dbId);

  try {
    // Execute the query
    const result = await db.getAllAsync(sql);
    return result;
  } catch (error) {
    console.error('Query execution error:', error);
    throw new Error(`Failed to execute query: ${error.message}`);
  }
};

const updateRow = async (dbId, rowId, data) => {
  const db = openDatabase(dbId);

  // Prepare the update statement
  const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), rowId];

  // Execute the update
  await db.runAsync(
    `UPDATE rows SET ${updates} WHERE id = ?`,
    values
  );
};

const deleteRow = async (dbId, rowId) => {
  const db = openDatabase(dbId);

  // Execute the delete
  await db.runAsync(
    'DELETE FROM rows WHERE id = ?',
    [rowId]
  );
};

const deleteDatabase = async (dbId) => {
  const db = openDatabase(dbId);

  // Drop the table
  await db.execAsync([{
    sql: 'DROP TABLE IF EXISTS rows',
    args: []
  }]);

  // Close the database connection
  db.closeAsync();
};

const getDatabaseSchema = async (dbId) => {
  const db = openDatabase(dbId);

  // Get the schema information
  const result = await db.getAllAsync(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='rows'"
  );

  if (result.length > 0) {
    const createTableSql = result[0].sql;
    // Parse the schema from the CREATE TABLE statement
    const schema = [];
    const columnMatches = createTableSql.match(/\(([^)]+)\)/);

    if (columnMatches && columnMatches[1]) {
      const columns = columnMatches[1].split(',').map(col => col.trim());

      for (const column of columns) {
        if (column.toLowerCase().startsWith('id')) continue;

        const [name, type] = column.split(/\s+/);
        schema.push({
          name: name.replace(/"/g, ''),
          type: type.toUpperCase()
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
