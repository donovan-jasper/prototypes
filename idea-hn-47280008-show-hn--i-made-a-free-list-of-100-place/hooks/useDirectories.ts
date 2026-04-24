import { useState, useEffect } from 'react';
import { getAllDirectories, searchDirectories, getTopDirectories, getDirectoriesByCategory, getPriorityRecommendations as getPriorityRecs } from '@/lib/directories';
import { Directory } from '@/lib/database';
import { Category } from '@/constants/categories';

export const useDirectories = () => {
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDirectories = async () => {
    setLoading(true);
    try {
      const data = await getAllDirectories();
      setDirectories(data);
    } catch (error) {
      console.error('Error loading directories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectories();
  }, []);

  const search = async (query: string) => {
    if (!query) {
      await loadDirectories();
      return;
    }

    setLoading(true);
    try {
      const results = await searchDirectories(query);
      setDirectories(results);
    } catch (error) {
      console.error('Error searching directories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (category: Category) => {
    setLoading(true);
    try {
      const results = await getDirectoriesByCategory(category);
      setDirectories(results);
    } catch (error) {
      console.error('Error filtering directories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopDirectoriesForCategory = async (category: Category, limit: number = 10) => {
    try {
      return await getTopDirectories(category, limit);
    } catch (error) {
      console.error('Error getting top directories:', error);
      return [];
    }
  };

  const getPriorityRecommendations = async (category: Category, limit: number = 10) => {
    try {
      return await getPriorityRecs(category, limit);
    } catch (error) {
      console.error('Error getting priority recommendations:', error);
      return [];
    }
  };

  const refresh = async () => {
    await loadDirectories();
  };

  return {
    directories,
    loading,
    searchDirectories: search,
    filterByCategory,
    getTopDirectories: getTopDirectoriesForCategory,
    getPriorityRecommendations,
    refresh,
  };
};
