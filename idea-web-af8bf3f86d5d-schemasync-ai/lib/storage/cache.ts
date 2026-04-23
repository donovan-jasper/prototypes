import * as SQLite from 'expo-sqlite';
import { fetchSchemaFromDatabase } from '@/lib/database/connectors';
import { useNetworkStore } from '@/store/network-store';

const db = SQLite.openDatabase('querypal.db');

export async function getSchema(databaseId: string, forceRefresh = false): Promise<any> {
  const { isOnline } = useNetworkStore.getState();

  // If we're offline and not forcing refresh, try to get cached data
  if (!isOnline && !forceRefresh) {
    const cachedSchema = await getCachedSchema(databaseId);
    if (cachedSchema) {
      return cachedSchema;
    }
    throw new Error('No cached schema available and offline');
  }

  // If we're online or forcing refresh, try to fetch fresh data
  try {
    const schema = await fetchSchemaFromDatabase(databaseId);
    await cacheSchema(databaseId, schema);
    return schema;
  } catch (error) {
    // If we can't fetch fresh data but have cached data, return that
    const cachedSchema = await getCachedSchema(databaseId);
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
              lastUpdated: new Date(row.last_updated),
              isCached: true
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

export async function clearSchemaCache(databaseId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM cached_schemas WHERE database_id = ?',
        [databaseId],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}
