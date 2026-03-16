import { useState, useEffect } from 'react';
import { initPurchases, getOfferings, purchasePackage, restorePurchases } from '../lib/subscription/paywall';
import { getUserSettings, saveUserSettings } from '../lib/storage/database';

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [offerings, setOfferings] = useState([]);

  useEffect(() => {
    const loadSettings = async () => {
      await initPurchases();
      const settings = await getUserSettings();
      if (settings) {
        setIsDarkMode(settings.darkMode);
        setSubscriptionTier(settings.subscriptionTier);
        setIsSubscribed(settings.subscriptionTier !== 'free');
      }
      const packages = await getOfferings();
      setOfferings(packages);
    };
    loadSettings();
  }, []);

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    await saveUserSettings({
      darkMode: newDarkMode,
      subscriptionTier,
      lastUpdated: Date.now(),
    });
  };

  const purchase = async (package) => {
    const customerInfo = await purchasePackage(package);
    if (customerInfo.entitlements.active['premium']) {
      setIsSubscribed(true);
      setSubscriptionTier('premium');
      await saveUserSettings({
        darkMode: isDarkMode,
        subscriptionTier: 'premium',
        lastUpdated: Date.now(),
      });
    }
  };

  const restore = async () => {
    const customerInfo = await restorePurchases();
    if (customerInfo.entitlements.active['premium']) {
      setIsSubscribed(true);
      setSubscriptionTier('premium');
      await saveUserSettings({
        darkMode: isDarkMode,
        subscriptionTier: 'premium',
        lastUpdated: Date.now(),
      });
    }
  };

  return {
    isSubscribed,
    subscriptionTier,
    isDarkMode,
    offerings,
    toggleDarkMode,
    purchase,
    restore,
  };
};
