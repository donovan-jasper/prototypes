import React, { createContext, useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    onError: string;
  };
  dark: boolean;
};

type SettingsContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  textSize: number;
  setTextSize: (size: number) => void;
  emergencyContact: {
    name: string;
    phone: string;
  } | null;
  setEmergencyContact: (contact: { name: string; phone: string } | null) => void;
};

const defaultTheme: Theme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#000000',
    border: '#E0E0E0',
    notification: '#FF3B30',
    error: '#FF3B30',
    onError: '#FFFFFF',
  },
  dark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
    error: '#FF453A',
    onError: '#FFFFFF',
  },
  dark: true,
};

export const SettingsContext = createContext<SettingsContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  textSize: 1,
  setTextSize: () => {},
  emergencyContact: null,
  setEmergencyContact: () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [textSize, setTextSize] = useState<number>(1);
  const [emergencyContact, setEmergencyContact] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedTextSize = await AsyncStorage.getItem('textSize');
        const savedEmergencyContact = await AsyncStorage.getItem('emergencyContact');

        if (savedTheme) {
          setTheme(JSON.parse(savedTheme));
        } else {
          const colorScheme = Appearance.getColorScheme();
          setTheme(colorScheme === 'dark' ? darkTheme : defaultTheme);
        }

        if (savedTextSize) {
          setTextSize(parseFloat(savedTextSize));
        }

        if (savedEmergencyContact) {
          setEmergencyContact(JSON.parse(savedEmergencyContact));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    AsyncStorage.setItem('theme', JSON.stringify(newTheme));
  };

  const updateTextSize = (size: number) => {
    setTextSize(size);
    AsyncStorage.setItem('textSize', size.toString());
  };

  const updateEmergencyContact = (contact: { name: string; phone: string } | null) => {
    setEmergencyContact(contact);
    if (contact) {
      AsyncStorage.setItem('emergencyContact', JSON.stringify(contact));
    } else {
      AsyncStorage.removeItem('emergencyContact');
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme: updateTheme,
        textSize,
        setTextSize: updateTextSize,
        emergencyContact,
        setEmergencyContact: updateEmergencyContact,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
