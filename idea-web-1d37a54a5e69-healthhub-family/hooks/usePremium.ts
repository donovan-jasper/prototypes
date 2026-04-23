import { useState, useEffect } from 'react';
import { isPremium as checkPremium, checkDocumentLimit as checkDocLimit } from '../lib/premiumService';

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const loadPremiumStatus = async () => {
      const premium = await checkPremium();
      setIsPremium(premium);
    };

    loadPremiumStatus();
  }, []);

  const checkDocumentLimit = async (currentCount: number): Promise<boolean> => {
    return await checkDocLimit(currentCount);
  };

  return { isPremium, checkDocumentLimit };
};
