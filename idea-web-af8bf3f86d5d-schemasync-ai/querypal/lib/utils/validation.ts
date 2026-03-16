export const validateDatabaseConnection = (connectionString: string) => {
  // Basic validation - in production, use a proper library
  if (!connectionString.includes('://')) {
    throw new Error('Invalid connection string format');
  }

  const [protocol, rest] = connectionString.split('://');
  if (!['postgresql', 'mysql', 'supabase'].includes(protocol)) {
    throw new Error('Unsupported database type');
  }

  if (!rest.includes('@')) {
    throw new Error('Missing credentials in connection string');
  }
};

export const validateQuery = (query: string) => {
  if (!query.trim()) {
    throw new Error('Query cannot be empty');
  }

  // Basic safety check - only allow SELECT queries
  if (!query.toUpperCase().startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed');
  }
};
