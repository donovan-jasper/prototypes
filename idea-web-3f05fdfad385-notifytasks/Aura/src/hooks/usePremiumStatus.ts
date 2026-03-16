import { useState, useEffect } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import { AppConstants } from '../constants/AppConstants';

export const usePremiumStatus = () => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        await InAppPurchases.connectAsync();
        const history = await InAppPurchases.getPurchaseHistoryAsync();
        const premiumPurchase = history.find(
          (purchase) => purchase.productId === AppConstants.PREMIUM_PRODUCT_ID && purchase.isValid
        );
        setIsPremium(!!premiumPurchase);
      } catch (error) {
        console.error('Error checking premium status:', error);
      } finally {
        await InAppPurchases.disconnectAsync();
      }
    };

    checkPremiumStatus();
  }, []);

  return isPremium;
};
