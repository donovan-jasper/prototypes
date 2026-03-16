import { useState, useEffect } from 'react';
import { getCategories } from '../services/database';
import { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        setSelectedCategoryId(fetchedCategories[0].id);
      }
    };
    fetchCategories();
  }, []);

  return { categories, selectedCategoryId, setSelectedCategoryId };
};
