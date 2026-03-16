import { DatabaseConnector } from './connectors';

export const executeQuery = async (databaseId: string, sql: string) => {
  // Get database connection details from store
  const database = getDatabaseById(databaseId);

  if (!database) {
    throw new Error('Database not found');
  }

  const connector = new DatabaseConnector(database.type);
  await connector.connect(database.connectionString);

  try {
    const results = await connector.query(sql);
    return results;
  } finally {
    await connector.disconnect();
  }
};
