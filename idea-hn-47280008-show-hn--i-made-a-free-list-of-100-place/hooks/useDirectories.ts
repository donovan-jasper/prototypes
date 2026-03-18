import { useState, useEffect } from 'react';
import { Directory } from '@/lib/database';
import { 
  getAllDirectories, 
  searchDirectories as searchDirectoriesDb,
  getDirectoriesByCategories 
} from '@/lib/directories';
import { initDatabase, seedDatabase } from '@/lib/seed';

export function useDirectories() {
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDirectories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize database and seed if needed
      await initDatabase();
      await seedDatabase();
      
      const data = await getAllDirectories();
      setDirectories(data);
    } catch (err) {
      console.error('Error loading directories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load directories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectories();
  }, []);

  const refresh = async () => {
    await loadDirectories();
  };

  const searchDirectories = async (query: string) => {
    if (!query.trim()) {
      await loadDirectories();
      return;
    }

    try {
      setLoading(true);
      const results = await searchDirectoriesDb(query);
      setDirectories(results);
    } catch (err) {
      console.error('Error searching directories:', err);
      setError(err instanceof Error ? err.message : 'Failed to search directories');
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (categories: string[]) => {
    try {
      setLoading(true);
      const results = await getDirectoriesByCategories(categories);
      setDirectories(results);
    } catch (err) {
      console.error('Error filtering directories:', err);
      setError(err instanceof Error ? err.message : 'Failed to filter directories');
    } finally {
      setLoading(false);
    }
  };

  return {
    directories,
    loading,
    error,
    refresh,
    searchDirectories,
    filterByCategory,
  };
}
