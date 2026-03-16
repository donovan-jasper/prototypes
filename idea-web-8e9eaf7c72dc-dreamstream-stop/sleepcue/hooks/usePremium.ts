import { useState, useEffect, useCallback } from 'react';
import { DatabaseService } from '../services/database';

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const database = new DatabaseService();

  const loadPremiumStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const settings = await database.getUserSettings();
      setIsPremium(settings.isPremium);
    } catch (error) {
      console.error('Failed to load premium status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePremiumStatus = useCallback(async (premiumStatus: boolean) => {
    try {
      await database.updateUserSettings({ isPremium: premiumStatus });
      setIsPremium(premiumStatus);
    } catch (error) {
      console.error('Failed to update premium status:', error);
    }
  }, []);

  useEffect(() => {
    loadPremiumStatus();
  }, [loadPremiumStatus]);

  return {
    isPremium,
    isLoading,
    updatePremiumStatus,
  };
}
