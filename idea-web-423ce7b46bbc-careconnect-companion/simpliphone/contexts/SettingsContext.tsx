import { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

interface SettingsContextType {
  theme: any;
  toggleTheme: () => void;
  emergencyContact: EmergencyContact | null;
  setEmergencyContact: (contact: EmergencyContact) => void;
}

export const SettingsContext = createContext<SettingsContextType>({
  theme: DefaultTheme,
  toggleTheme: () => {},
  emergencyContact: null,
  setEmergencyContact: () => {},
});

export const SettingsProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme === 'dark' ? DarkTheme : DefaultTheme);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact | null>(null);

  const toggleTheme = () => {
    setTheme(theme.dark ? DefaultTheme : DarkTheme);
  };

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? DarkTheme : DefaultTheme);
  }, [colorScheme]);

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, emergencyContact, setEmergencyContact }}>
      {children}
    </SettingsContext.Provider>
  );
};
