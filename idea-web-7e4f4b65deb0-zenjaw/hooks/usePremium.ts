import { useState, useEffect } from 'react';
import { openDatabase, getUserSetting, setUserSetting } from '@/services/database';

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const db = openDatabase();
      const premiumStatus = await getUserSetting(db, 'premium_status');
      setIsPremium(premiumStatus === 'true');
    } catch (error) {
      console.error('Failed to check premium status:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchasePremium = async () => {
    try {
      const db = openDatabase();
      await setUserSetting(db, 'premium_status', 'true');
      setIsPremium(true);
    } catch (error) {
      console.error('Failed to purchase premium:', error);
      throw error;
    }
  };

  const cancelPremium = async () => {
    try {
      const db = openDatabase();
      await setUserSetting(db, 'premium_status', 'false');
      setIsPremium(false);
    } catch (error) {
      console.error('Failed to cancel premium:', error);
      throw error;
    }
  };

  return {
    isPremium,
    loading,
    checkPremiumStatus,
    purchasePremium,
    cancelPremium,
  };
}
