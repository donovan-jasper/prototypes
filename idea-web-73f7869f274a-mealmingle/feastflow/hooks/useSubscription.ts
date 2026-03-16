import { useState, useEffect } from 'react';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSubscriptionStatus = () => {
    setLoading(true);
    // Mock subscription status
    setTimeout(() => {
      setSubscription({
        isPro: false, // Change to true for Pro users
        orderCount: 2, // Mock order count
      });
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  return {
    subscription,
    loading,
    fetchSubscription: fetchSubscriptionStatus,
  };
};
