import { useState, useEffect } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';

export const usePremiumStatus = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [maxPinnedTasks, setMaxPinnedTasks] = useState(3);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        await InAppPurchases.connectAsync();

        // Check for active subscriptions
        const purchases = await InAppPurchases.getPurchaseHistoryAsync();

        // In a real app, you would check for a specific premium subscription
        // For this example, we'll just check if any purchases exist
        const hasPremium = purchases.length > 0;

        setIsPremium(hasPremium);
        setMaxPinnedTasks(hasPremium ? Infinity : 3);

        await InAppPurchases.disconnectAsync();
      } catch (error) {
        console.error('Error checking subscription:', error);
        // Default to free tier if there's an error
        setIsPremium(false);
        setMaxPinnedTasks(3);
      }
    };

    checkSubscription();

    // Set up listener for purchase updates
    const subscription = InAppPurchases.setPurchaseListener(({ responseCode, results, error }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        // Check if any of the purchases are premium
        const hasPremium = results.some(purchase =>
          purchase.productId === 'aura_premium_subscription'
        );

        setIsPremium(hasPremium);
        setMaxPinnedTasks(hasPremium ? Infinity : 3);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return { isPremium, maxPinnedTasks };
};
