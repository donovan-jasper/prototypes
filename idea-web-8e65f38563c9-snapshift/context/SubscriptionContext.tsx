import React, { createContext, useState, useEffect } from 'react';
import { checkSubscriptionStatus, purchaseSubscription, restorePurchases } from '../services/subscription';

interface SubscriptionContextType {
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  purchaseSubscription: (isAnnual: boolean) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  isFeatureUnlocked: (feature: 'unlimitedPrompts' | 'fullLibrary' | 'multipleGoals') => boolean;
}

export const SubscriptionContext = createContext<SubscriptionContextType>({
  isPremium: false,
  isLoading: true,
  error: null,
  purchaseSubscription: async () => false,
  restorePurchases: async () => false,
  isFeatureUnlocked: () => false,
});

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const handlePurchaseSubscription = async (isAnnual: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await purchaseSubscription(isAnnual);
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

  const handleRestorePurchases = async () => {
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

  const checkFeatureUnlocked = (feature: 'unlimitedPrompts' | 'fullLibrary' | 'multipleGoals') => {
    if (!isPremium) return false;

    switch (feature) {
      case 'unlimitedPrompts':
        return true;
      case 'fullLibrary':
        return true;
      case 'multipleGoals':
        return true;
      default:
        return false;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        isLoading,
        error,
        purchaseSubscription: handlePurchaseSubscription,
        restorePurchases: handleRestorePurchases,
        isFeatureUnlocked: checkFeatureUnlocked,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
