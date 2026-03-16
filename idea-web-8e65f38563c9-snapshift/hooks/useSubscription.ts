import { useState, useEffect } from 'react';
import { checkSubscriptionStatus, purchaseSubscription as purchase } from '../services/subscription';

export const useSubscription = () => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      const status = await checkSubscriptionStatus();
      setIsPremium(status);
    };

    loadSubscriptionStatus();
  }, []);

  const purchaseSubscription = async () => {
    const success = await purchase();
    if (success) {
      setIsPremium(true);
    }
    return success;
  };

  return { isPremium, purchaseSubscription };
};
