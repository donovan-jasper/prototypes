import React, { createContext, useState, useEffect } from 'react';
import { checkSubscriptionStatus } from '../services/subscription';

interface SubscriptionContextType {
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
  isFeatureUnlocked: (feature: string) => boolean;
}

export const SubscriptionContext = createContext<SubscriptionContextType>({
  isPremium: false,
  setIsPremium: () => {},
  isFeatureUnlocked: () => false,
});

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const initializeSubscription = async () => {
      const status = await checkSubscriptionStatus();
      setIsPremium(status);
    };

    initializeSubscription();
  }, []);

  const isFeatureUnlocked = (feature: string) => {
    if (feature === 'unlimitedPrompts') return isPremium;
    if (feature === 'multipleGoals') return isPremium;
    if (feature === 'fullLibrary') return isPremium;
    if (feature === 'personalizedTTS') return isPremium;
    return true; // Default to unlocked for other features
  };

  return (
    <SubscriptionContext.Provider value={{ isPremium, setIsPremium, isFeatureUnlocked }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
