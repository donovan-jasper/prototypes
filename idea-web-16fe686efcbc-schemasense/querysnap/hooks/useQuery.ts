import { useState } from 'react';
import { generateSQL, validateQuery } from '../lib/ai';
import { executeQuery } from '../lib/database';
import useStore from '../lib/store';

export const useQuery = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { databases, addQuery } = useStore();

  const executeQuery = async (text, dbId) => {
    setLoading(true);
    setError(null);

    try {
      const db = databases.find((db) => db.id === dbId);
      if (!db) throw new Error('Database not found');

      const sql = await generateSQL(text, db.schema);
      if (!validateQuery(sql)) throw new Error('Invalid query');

      const result = await executeQuery(db.connection, sql);
      setResults(result.rows._array);
      addQuery({ text, sql, results: result.rows._array });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, executeQuery };
};
