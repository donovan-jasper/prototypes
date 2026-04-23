import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';

export const usePremiumStatus = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [maxPinnedTasks, setMaxPinnedTasks] = useState(3);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        await InAppPurchases.connectAsync();

        // For testing purposes, you might want to use a test product ID
        const productId = Platform.OS === 'ios'
          ? 'com.yourapp.aura.premium'
          : 'com.yourapp.aura.premium';

        const purchases = await InAppPurchases.getPurchaseHistoryAsync();

        // Check if user has an active subscription
        const hasActiveSubscription = purchases.some(purchase =>
          purchase.productId === productId &&
          purchase.isCancelled === false &&
          (purchase.expirationDate === null || new Date(purchase.expirationDate) > new Date())
        );

        setIsPremium(hasActiveSubscription);
        setMaxPinnedTasks(hasActiveSubscription ? Infinity : 3);

        await InAppPurchases.disconnectAsync();
      } catch (error) {
        console.error('Error checking subscription:', error);
        // Fallback to free tier if there's an error
        setIsPremium(false);
        setMaxPinnedTasks(3);
      }
    };

    checkSubscription();

    // Set up listener for purchase updates
    const subscription = InAppPurchases.setPurchaseListener(({ responseCode, results, error }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        checkSubscription();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return { isPremium, maxPinnedTasks };
};
