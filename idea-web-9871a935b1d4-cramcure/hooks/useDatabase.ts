import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { initDatabase } from '@/services/database';

export function useDatabase() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function setupDatabase() {
      try {
        const database = await initDatabase();
        if (mounted) {
          setDb(database);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize database'));
          setIsLoading(false);
        }
      }
    }

    setupDatabase();

    return () => {
      mounted = false;
    };
  }, []);

  return { db, isLoading, error };
}
