import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserSettings } from '../lib/database';

interface AppContextType {
  isPremium: boolean;
  setPremiumStatus: (status: boolean) => void;
  userId: string;
  streak: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [userId, setUserId] = useState('currentUser');
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getUserSettings();
      if (settings) {
        setIsPremium(settings.premiumStatus === 1);
        setUserId(settings.userId || 'currentUser');
        setStreak(settings.streak || 0);
      }
    };

    loadSettings();
  }, []);

  const setPremiumStatus = (status: boolean) => {
    setIsPremium(status);
    // Update in database
  };

  return (
    <AppContext.Provider value={{ isPremium, setPremiumStatus, userId, streak }}>
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
