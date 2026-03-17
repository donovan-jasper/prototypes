import { getCachedSchema, cacheSchema } from './sqlite';
import { DatabaseConnector } from '../database/connectors';
import { parsePostgresSchema, parseTableRelationships } from '../database/schema-parser';
import { useDatabaseStore } from '../../store/database-store';

export const fetchAndCacheSchema = async (database: any) => {
  const connector = new DatabaseConnector(database.type);
  await connector.connect(database.connectionString);

  try {
    // Get schema metadata
    const schemaData = await connector.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // Get foreign key relationships
    const constraints = await connector.query(`
      SELECT
        tc.table_name AS table,
        kcu.column_name AS column,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY'
    `);

    const schema = {
      tables: parsePostgresSchema(schemaData),
      relationships: parseTableRelationships(constraints),
    };

    await cacheSchema(database.id, schema);
    return schema;
  } finally {
    await connector.disconnect();
  }
};

export const getSchema = async (databaseId: string, forceRefresh = false) => {
  if (!forceRefresh) {
    const cachedSchema = await getCachedSchema(databaseId);
    if (cachedSchema) {
      return cachedSchema;
    }
  }

  // Get database details from store
  const { databases } = useDatabaseStore.getState();
  const database = databases.find(db => db.id === databaseId);
  
  if (!database) {
    throw new Error('Database not found');
  }

  return await fetchAndCacheSchema(database);
};
