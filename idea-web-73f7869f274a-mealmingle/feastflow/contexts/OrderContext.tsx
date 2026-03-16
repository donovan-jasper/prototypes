import React, { createContext } from 'react';
import { useOrder } from '../hooks/useOrder';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const orderHook = useOrder();

  return (
    <OrderContext.Provider value={orderHook}>
      {children}
    </OrderContext.Provider>
  );
};
