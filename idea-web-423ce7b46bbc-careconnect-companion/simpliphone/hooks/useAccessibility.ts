import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

export const useAccessibility = () => {
  const { theme } = useContext(SettingsContext);

  const useTextSize = () => {
    return {
      fontSize: theme.textSize,
    };
  };

  const useHighContrast = () => {
    return {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    };
  };

  const useVoiceLabels = () => {
    return {
      accessibilityLabel: 'Accessible label',
    };
  };

  return {
    useTextSize,
    useHighContrast,
    useVoiceLabels,
  };
};
