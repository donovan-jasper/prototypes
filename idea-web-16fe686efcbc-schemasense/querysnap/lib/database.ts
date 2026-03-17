import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { parseCSV, importToSQLite } from './parser';

export const createDatabase = async (name: string) => {
  return SQLite.openDatabase(name);
};

export const executeQuery = async (db: any, sql: string) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        sql,
        [],
        (_: any, result: any) => resolve(result),
        (_: any, error: any) => reject(error)
      );
    });
  });
};

export const getSchema = async (db: any) => {
  const tables: any = await executeQuery(db, "SELECT name FROM sqlite_master WHERE type='table'");
  const schema: any = { tables: [], columns: {} };

  for (const table of tables.rows._array) {
    schema.tables.push(table.name);
    const columns: any = await executeQuery(db, `PRAGMA table_info(${table.name})`);
    schema.columns[table.name] = columns.rows._array.map((col: any) => col.name);
  }

  return schema;
};

export const importDatabase = async (file: any) => {
  const fileName = file.name.replace(/\.[^/.]+$/, '');
  const db = await createDatabase(fileName);
  
  if (file.mimeType === 'text/csv' || file.name.endsWith('.csv')) {
    const content = await FileSystem.readAsStringAsync(file.uri);
    const data = parseCSV(content);
    await importToSQLite(db, 'imported_data', data);
  } else if (file.mimeType?.includes('sqlite') || file.name.endsWith('.db') || file.name.endsWith('.sqlite')) {
    const dbPath = `${FileSystem.documentDirectory}SQLite/${fileName}.db`;
    await FileSystem.copyAsync({
      from: file.uri,
      to: dbPath,
    });
  }
  
  const schema = await getSchema(db);
  return { db, schema, name: fileName };
};

export const closeDatabase = async (db: any) => {
  db.close();
};
