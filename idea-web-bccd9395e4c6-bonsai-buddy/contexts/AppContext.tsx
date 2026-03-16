import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  isPremium: boolean;
  theme: 'light' | 'dark';
  setIsPremium: (value: boolean) => void;
  setTheme: (value: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <AppContext.Provider value={{ isPremium, theme, setIsPremium, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
