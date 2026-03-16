import * as SQLite from 'expo-sqlite';

export const createDatabase = async (name) => {
  return SQLite.openDatabase(name);
};

export const executeQuery = async (db, sql) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        [],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSchema = async (db) => {
  const tables = await executeQuery(db, "SELECT name FROM sqlite_master WHERE type='table'");
  const schema = { tables: [], columns: {} };

  for (const table of tables.rows._array) {
    schema.tables.push(table.name);
    const columns = await executeQuery(db, `PRAGMA table_info(${table.name})`);
    schema.columns[table.name] = columns.rows._array.map((col) => col.name);
  }

  return schema;
};

export const importDatabase = async (db, data) => {
  // Implement import functionality
};

export const closeDatabase = async (db) => {
  db.close();
};
