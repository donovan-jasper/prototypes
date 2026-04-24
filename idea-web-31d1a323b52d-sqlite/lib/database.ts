import * as SQLite from 'expo-sqlite';
import { useStore } from './store';

export interface DatabaseField {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB';
  value?: string | number;
}

export interface DatabaseInfo {
  name: string;
  fields: DatabaseField[];
  rowCount: number;
}

const db = SQLite.openDatabase('datapal.db');

export const useDatabase = () => {
  const { databases, addDatabase, removeDatabase } = useStore();

  const createDatabase = async (name: string, fields: DatabaseField[]): Promise<void> => {
    return new Promise((resolve, reject) => {
      const fieldDefinitions = fields.map(field => `${field.name} ${field.type}`).join(', ');
      const sql = `CREATE TABLE IF NOT EXISTS ${name} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${fieldDefinitions})`;

      db.transaction(
        tx => {
          tx.executeSql(
            sql,
            [],
            () => {
              addDatabase({ name, fields, rowCount: 0 });
              resolve();
            },
            (_, error) => reject(error)
          );
        },
        reject
      );
    });
  };

  const insertRow = async (table: string, data: Record<string, any>): Promise<number> => {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

      db.transaction(
        tx => {
          tx.executeSql(
            sql,
            values,
            (_, result) => resolve(result.insertId),
            (_, error) => reject(error)
          );
        },
        reject
      );
    });
  };

  const queryDatabase = async (table: string, sql: string): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            sql,
            [],
            (_, result) => {
              const rows = [];
              for (let i = 0; i < result.rows.length; i++) {
                rows.push(result.rows.item(i));
              }
              resolve(rows);
            },
            (_, error) => reject(error)
          );
        },
        reject
      );
    });
  };

  const getDatabaseSchema = async (): Promise<Record<string, DatabaseField[]>> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table'",
            [],
            (_, result) => {
              const schemas: Record<string, DatabaseField[]> = {};

              // Process each table
              const processTable = (index: number) => {
                if (index >= result.rows.length) {
                  resolve(schemas);
                  return;
                }

                const tableName = result.rows.item(index).name;

                // Skip sqlite_sequence table
                if (tableName === 'sqlite_sequence') {
                  processTable(index + 1);
                  return;
                }

                // Get table info
                tx.executeSql(
                  `PRAGMA table_info(${tableName})`,
                  [],
                  (_, infoResult) => {
                    const fields: DatabaseField[] = [];
                    for (let i = 0; i < infoResult.rows.length; i++) {
                      const row = infoResult.rows.item(i);
                      fields.push({
                        name: row.name,
                        type: row.type as DatabaseField['type']
                      });
                    }
                    schemas[tableName] = fields;
                    processTable(index + 1);
                  },
                  (_, error) => reject(error)
                );
              };

              processTable(0);
            },
            (_, error) => reject(error)
          );
        },
        reject
      );
    });
  };

  const deleteDatabase = async (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `DROP TABLE IF EXISTS ${name}`,
            [],
            () => {
              removeDatabase(name);
              resolve();
            },
            (_, error) => reject(error)
          );
        },
        reject
      );
    });
  };

  const listDatabases = async (): Promise<DatabaseInfo[]> => {
    const schemas = await getDatabaseSchema();
    const databaseList: DatabaseInfo[] = [];

    for (const [name, fields] of Object.entries(schemas)) {
      const rowCount = await new Promise<number>((resolve, reject) => {
        db.transaction(
          tx => {
            tx.executeSql(
              `SELECT COUNT(*) as count FROM ${name}`,
              [],
              (_, result) => resolve(result.rows.item(0).count),
              (_, error) => reject(error)
            );
          },
          reject
        );
      });

      databaseList.push({
        name,
        fields,
        rowCount
      });
    }

    return databaseList;
  };

  const deleteRow = async (table: string, rowId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql(
            `DELETE FROM ${table} WHERE id = ?`,
            [rowId],
            () => resolve(),
            (_, error) => reject(error)
          );
        },
        reject
      );
    });
  };

  return {
    createDatabase,
    insertRow,
    queryDatabase,
    getDatabaseSchema,
    deleteDatabase,
    listDatabases,
    deleteRow
  };
};
