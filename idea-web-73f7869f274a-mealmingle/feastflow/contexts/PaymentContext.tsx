import React, { createContext } from 'react';
import { usePayment } from '../hooks/usePayment';

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const paymentHook = usePayment();

  return (
    <PaymentContext.Provider value={paymentHook}>
      {children}
    </PaymentContext.Provider>
  );
};
