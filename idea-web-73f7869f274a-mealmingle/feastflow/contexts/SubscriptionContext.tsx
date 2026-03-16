import React, { createContext } from 'react';
import { useSubscription } from '../hooks/useSubscription';

export const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const subscriptionHook = useSubscription();

  return (
    <SubscriptionContext.Provider value={subscriptionHook}>
      {children}
    </SubscriptionContext.Provider>
  );
};
