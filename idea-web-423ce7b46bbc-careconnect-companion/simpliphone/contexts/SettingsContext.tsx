import { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme === 'dark' ? DarkTheme : DefaultTheme);

  const toggleTheme = () => {
    setTheme(theme.dark ? DefaultTheme : DarkTheme);
  };

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? DarkTheme : DefaultTheme);
  }, [colorScheme]);

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};
