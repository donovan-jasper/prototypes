import { Switch } from 'react-native';
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(SettingsContext);

  return (
    <Switch
      value={theme.dark}
      onValueChange={toggleTheme}
    />
  );
}
