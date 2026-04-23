import { useState, useEffect } from 'react';
import { checkSubscriptionStatus, purchaseSubscription as purchase, restorePurchases } from '../services/subscription';

export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      try {
        setIsLoading(true);
        const status = await checkSubscriptionStatus();
        setIsPremium(status);
      } catch (err) {
        setError('Failed to check subscription status');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionStatus();
  }, []);

  const purchaseSubscription = async (isAnnual: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await purchase(isAnnual);
      if (success) {
        setIsPremium(true);
      }
      return success;
    } catch (err) {
      setError('Purchase failed. Please try again.');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchasesHandler = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const restored = await restorePurchases();
      if (restored) {
        setIsPremium(true);
      }
      return restored;
    } catch (err) {
      setError('Restore failed. Please try again.');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isPremium,
    isLoading,
    error,
    purchaseSubscription,
    restorePurchases: restorePurchasesHandler
  };
};
