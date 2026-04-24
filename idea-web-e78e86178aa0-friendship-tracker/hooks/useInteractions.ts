import { useState, useEffect } from 'react';
import { Interaction } from '../types';
import { getAllInteractions } from '../lib/database';

export const useInteractions = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInteractions = async () => {
    try {
      const data = await getAllInteractions();
      setInteractions(data);
    } catch (error) {
      console.error('Error loading interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInteractions();
  }, []);

  const refreshInteractions = async () => {
    setLoading(true);
    await loadInteractions();
  };

  return {
    interactions,
    loading,
    refreshInteractions,
  };
};
