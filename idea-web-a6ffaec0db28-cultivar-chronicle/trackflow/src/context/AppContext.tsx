import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);

  return (
    <AppContext.Provider value={{ isPremium, setIsPremium }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
