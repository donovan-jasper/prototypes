import { useState, useEffect } from 'react';
import { DatabaseService } from '../services/database';

const useDatabase = () => {
  const [db, setDb] = useState<DatabaseService | null>(null);

  useEffect(() => {
    const databaseService = new DatabaseService();
    setDb(databaseService);
  }, []);

  return db;
};

export default useDatabase;
