import { useState } from 'react';
import { executeQuery as dbExecuteQuery, getSchema } from '../lib/database';
import { generateSQL, validateQuery } from '../lib/ai';

export const useQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async (databaseId: string, naturalLanguageQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get database schema
      const schema = await getSchema(databaseId);

      // Generate SQL from natural language
      const sqlQuery = await generateSQL(naturalLanguageQuery, schema);

      // Validate the generated SQL
      if (!validateQuery(sqlQuery)) {
        throw new Error('Generated SQL is invalid');
      }

      // Execute the query
      const results = await dbExecuteQuery(databaseId, sqlQuery);

      return results;
    } catch (err) {
      console.error('Query execution error:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute query');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeQuery,
    isLoading,
    error,
  };
};
