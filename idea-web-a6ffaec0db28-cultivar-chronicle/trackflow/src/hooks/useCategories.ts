import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { getCategories } from '../services/database';
import { Category } from '../types';

export const useCategories = () => {
  const { selectedCategoryId, setSelectedCategoryId } = useContext(AppContext);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const loadedCategories = await getCategories();
        setCategories(loadedCategories);

        if (loadedCategories.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(loadedCategories[0].id);
        }
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const selectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

  return {
    categories,
    selectedCategoryId,
    selectCategory,
    isLoading,
    error,
  };
};
