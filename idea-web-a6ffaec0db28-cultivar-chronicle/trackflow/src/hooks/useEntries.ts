import { useState, useEffect } from 'react';
import { getEntries } from '../services/database';
import { Entry } from '../types';

export const useEntries = (categoryId: number) => {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const fetchedEntries = await getEntries(categoryId);
      setEntries(fetchedEntries);
    };
    fetchEntries();
  }, [categoryId]);

  return { entries };
};
