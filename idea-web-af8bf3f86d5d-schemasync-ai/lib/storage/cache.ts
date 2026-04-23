import * as SQLite from 'expo-sqlite';
import { fetchSchemaFromDatabase } from '@/lib/database/connectors';

const db = SQLite.openDatabase('querypal.db');

export async function getSchema(databaseId: string, forceRefresh = false): Promise<any> {
  // Check if we have cached data
  const cachedSchema = await getCachedSchema(databaseId);

  if (cachedSchema && !forceRefresh) {
    return cachedSchema;
  }

  // If we need to refresh or don't have cached data, fetch from database
  try {
    const schema = await fetchSchemaFromDatabase(databaseId);
    await cacheSchema(databaseId, schema);
    return schema;
  } catch (error) {
    // If we can't fetch fresh data but have cached data, return that
    if (cachedSchema) {
      return cachedSchema;
    }
    throw error;
  }
}

async function getCachedSchema(databaseId: string): Promise<any | null> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT schema_data, last_updated FROM cached_schemas WHERE database_id = ?',
        [databaseId],
        (_, result) => {
          if (result.rows.length > 0) {
            const row = result.rows.item(0);
            resolve({
              ...JSON.parse(row.schema_data),
              lastUpdated: new Date(row.last_updated)
            });
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

async function cacheSchema(databaseId: string, schema: any): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First delete any existing cache for this database
      tx.executeSql(
        'DELETE FROM cached_schemas WHERE database_id = ?',
        [databaseId]
      );

      // Then insert the new schema
      tx.executeSql(
        'INSERT INTO cached_schemas (database_id, schema_data, last_updated) VALUES (?, ?, ?)',
        [databaseId, JSON.stringify(schema), new Date().toISOString()],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}
