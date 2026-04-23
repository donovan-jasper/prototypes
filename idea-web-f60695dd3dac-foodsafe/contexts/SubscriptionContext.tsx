import React, { createContext, useState, useContext, useEffect } from 'react';
import { SubscriptionStatus } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SubscriptionContextType {
  subscription: SubscriptionStatus;
  isPremium: boolean;
  upgradeToPremium: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isPremium: false,
    expiresAt: undefined,
  });

  // Check subscription status on initial load
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const savedSubscription = await AsyncStorage.getItem('subscription');
        if (savedSubscription) {
          const parsed = JSON.parse(savedSubscription) as SubscriptionStatus;
          setSubscription(parsed);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      }
    };

    loadSubscription();
  }, []);

  // Save subscription to storage whenever it changes
  useEffect(() => {
    const saveSubscription = async () => {
      try {
        await AsyncStorage.setItem('subscription', JSON.stringify(subscription));
      } catch (error) {
        console.error('Error saving subscription:', error);
      }
    };

    saveSubscription();
  }, [subscription]);

  const upgradeToPremium = async () => {
    // In a real app, this would integrate with an in-app purchase system
    // For this prototype, we'll just simulate a successful upgrade

    // Calculate expiration date (1 month from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const newSubscription: SubscriptionStatus = {
      isPremium: true,
      expiresAt: expiresAt.toISOString(),
    };

    setSubscription(newSubscription);
  };

  const checkSubscription = async () => {
    // Check if subscription has expired
    if (subscription.isPremium && subscription.expiresAt) {
      const expiresAt = new Date(subscription.expiresAt);
      if (expiresAt < new Date()) {
        setSubscription({
          isPremium: false,
          expiresAt: undefined,
        });
      }
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isPremium: subscription.isPremium,
        upgradeToPremium,
        checkSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
