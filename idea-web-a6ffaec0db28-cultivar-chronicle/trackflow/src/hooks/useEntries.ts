import { useState, useEffect, useCallback } from 'react';
import { getEntries } from '../services/database';
import { Entry } from '../types';

export const useEntries = (categoryId: number) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  const fetchEntries = useCallback(async () => {
    const fetchedEntries = await getEntries(categoryId);
    setEntries(fetchedEntries);
  }, [categoryId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, refreshEntries: fetchEntries };
};
