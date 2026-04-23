import { useSubscription as useSubscriptionContext } from '@/contexts/SubscriptionContext';

export const useSubscription = () => {
  const { subscription, isPremium, upgradeToPremium, checkSubscription } = useSubscriptionContext();

  // Check subscription status when the hook is used
  checkSubscription();

  return {
    subscription,
    isPremium,
    upgradeToPremium,
    checkSubscription,
  };
};
