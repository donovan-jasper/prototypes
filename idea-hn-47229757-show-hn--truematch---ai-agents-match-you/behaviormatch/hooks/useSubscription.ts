import { useState, useEffect } from 'react';
import useStore from '../lib/store';

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useStore((state) => [
    state.subscriptionStatus,
    state.setSubscriptionStatus,
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the subscription status from your backend
    // For demonstration, we'll just set a default status
    setSubscriptionStatus('free');
    setLoading(false);
  }, []);

  const upgradeToPremium = async () => {
    // In a real app, you would implement the actual upgrade flow here
    // For demonstration, we'll just update the status
    setSubscriptionStatus('premium');
  };

  const isPremium = () => {
    return subscriptionStatus === 'premium';
  };

  return {
    subscriptionStatus,
    loading,
    upgradeToPremium,
    isPremium,
  };
};
