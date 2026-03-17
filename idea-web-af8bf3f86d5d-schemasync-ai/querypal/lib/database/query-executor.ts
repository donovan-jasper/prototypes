import { DatabaseConnector } from './connectors';

export const executeQuery = async (databaseId: string, connectionString: string, type: string, sql: string) => {
  if (!sql.trim()) {
    throw new Error('Query cannot be empty');
  }

  // Validate query is safe
  const upperSQL = sql.toUpperCase().trim();
  if (!upperSQL.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }

  const connector = new DatabaseConnector(type);
  
  try {
    await connector.connect(connectionString);
    const results = await connector.query(sql);
    return results;
  } finally {
    await connector.disconnect();
  }
};
