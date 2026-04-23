// Add this to the existing connectors.ts file
import { getSchema, cacheSchema } from '../storage/cache';

export const fetchAndCacheSchema = async (database: Database) => {
  try {
    const schema = await fetchSchema(database);
    await cacheSchema(database.id, schema);
    return schema;
  } catch (error) {
    console.error('Failed to fetch and cache schema:', error);
    throw error;
  }
};

// Add this to the existing fetchSchema function
const fetchSchema = async (database: Database) => {
  // Existing implementation for fetching schema from database
  // ...

  // After fetching, cache the schema
  await cacheSchema(database.id, schema);
  return schema;
};
