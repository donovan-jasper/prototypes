import React, { createContext, useState, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';

interface SubscriptionContextType {
  isPremium: boolean;
  upgradeToPremium: () => void;
}

export const SubscriptionContext = createContext<SubscriptionContextType>({
  isPremium: false,
  upgradeToPremium: () => {},
});

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPremium, purchaseSubscription } = useSubscription();

  const upgradeToPremium = async () => {
    await purchaseSubscription();
  };

  return (
    <SubscriptionContext.Provider value={{ isPremium, upgradeToPremium }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
