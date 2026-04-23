import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  isEmergency: boolean;
}

interface SettingsContextType {
  theme: 'light' | 'dark' | 'high-contrast';
  textSize: number;
  emergencyContacts: EmergencyContact[];
  setTheme: (theme: 'light' | 'dark' | 'high-contrast') => void;
  setTextSize: (size: number) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (id: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [textSize, setTextSize] = useState(1);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedTextSize = await AsyncStorage.getItem('textSize');
        const savedContacts = await AsyncStorage.getItem('emergencyContacts');

        if (savedTheme) setTheme(savedTheme as 'light' | 'dark' | 'high-contrast');
        if (savedTextSize) setTextSize(parseFloat(savedTextSize));
        if (savedContacts) setEmergencyContacts(JSON.parse(savedContacts));
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

  const addEmergencyContact = (contact: EmergencyContact) => {
    setEmergencyContacts(prev => [...prev, contact]);
  };

  const removeEmergencyContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(contact => contact.id !== id));
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        textSize,
        emergencyContacts,
        setTheme,
        setTextSize,
        setEmergencyContacts,
        addEmergencyContact,
        removeEmergencyContact,
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
