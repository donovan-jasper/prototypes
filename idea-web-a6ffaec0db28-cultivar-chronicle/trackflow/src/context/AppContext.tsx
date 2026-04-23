import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  isPremium: boolean;
  setIsPremium: (isPremium: boolean) => void;
}

export const AppContext = createContext<AppContextType>({
  selectedCategoryId: null,
  setSelectedCategoryId: () => {},
  isPremium: false,
  setIsPremium: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const premiumStatus = await AsyncStorage.getItem('isPremium');
        if (premiumStatus !== null) {
          setIsPremium(JSON.parse(premiumStatus));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('isPremium', JSON.stringify(isPremium));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };

    saveSettings();
  }, [isPremium]);

  return (
    <AppContext.Provider
      value={{
        selectedCategoryId,
        setSelectedCategoryId,
        isPremium,
        setIsPremium,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
