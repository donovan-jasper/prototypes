import { useState, useEffect } from 'react';
import { getAssets, getLiabilities } from '../lib/database';
import { calculateNetWorth } from '../lib/calculations';

export const useNetWorth = () => {
  const [netWorth, setNetWorth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNetWorth = async () => {
      try {
        const assets = await getAssets();
        const liabilities = await getLiabilities();
        const calculatedNetWorth = calculateNetWorth(assets, liabilities);
        setNetWorth(calculatedNetWorth);
      } catch (error) {
        console.error('Failed to load net worth', error);
      } finally {
        setLoading(false);
      }
    };

    loadNetWorth();
  }, []);

  return { netWorth, loading };
};
