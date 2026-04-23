import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Contact {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  isFavorite: boolean;
  isEmergency: boolean;
}

interface SettingsContextType {
  theme: 'light' | 'dark' | 'high-contrast';
  textSize: number;
  emergencyContacts: Contact[];
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  setTextSize: (size: number) => void;
  setEmergencyContacts: (contacts: Contact[]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [textSize, setTextSize] = useState(1);
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedTextSize = await AsyncStorage.getItem('textSize');
        const savedEmergencyContacts = await AsyncStorage.getItem('emergencyContacts');

        if (savedTheme) setTheme(savedTheme as 'light' | 'dark' | 'high-contrast');
        if (savedTextSize) setTextSize(parseFloat(savedTextSize));
        if (savedEmergencyContacts) setEmergencyContacts(JSON.parse(savedEmergencyContacts));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('theme', theme);
        await AsyncStorage.setItem('textSize', textSize.toString());
        await AsyncStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [theme, textSize, emergencyContacts]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        textSize,
        emergencyContacts,
        setTheme,
        setTextSize,
        setEmergencyContacts,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
