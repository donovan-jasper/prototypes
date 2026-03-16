import { useState, useEffect } from 'react';
import { Database } from '@/services/storage/database';

export function useDatabase() {
  const [database] = useState(new Database());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await database.init();
        setIsReady(true);
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initDatabase();
  }, []);

  return {
    database,
    isReady,
  };
}
