import { useState } from 'react';
import { generateSQL, validateQuery } from '../lib/ai';
import { executeQuery } from '../lib/database';
import useStore from '../lib/store';

export const useQuery = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { databases, addQuery } = useStore();

  const runQuery = async (text: string, dbId: string) => {
    setLoading(true);
    setError(null);

    try {
      const db = databases.find((db) => db.id === dbId);
      if (!db) throw new Error('Database not found');
      if (!db.connection) throw new Error('Database connection not available');

      const sql = await generateSQL(text, db.schema);
      if (!validateQuery(sql)) throw new Error('Invalid query');

      const result = await executeQuery(db.connection, sql);
      setResults(result.rows._array);
      addQuery({ text, sql, results: result.rows._array, timestamp: new Date().toISOString() });
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, runQuery };
};
